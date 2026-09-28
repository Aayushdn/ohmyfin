import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MARGIN = 12; // gap from the screen edge
const TAP_SLOP = 6; // movement (px) below which a touch counts as a tap

/**
 * Dev-only floating route jumper.
 *
 * - Collapsed: a small pill you can drag anywhere; it snaps to the left/right edge.
 *   Tap it to expand.
 * - Expanded: a path input. Drag it by the grip on the left. Type a route
 *   (e.g. /onboarding, /(app)/home, /profile?id=1) and press Go.
 * - Renders nothing in production builds.
 */
export function DevPathNavigator() {
  if (!__DEV__) return null;
  return <FloatingNavigator />;
}

function FloatingNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // ---- position state ------------------------------------------------
  const startY = screenH - insets.bottom - 90;
  const pan = useRef(new Animated.ValueXY({ x: MARGIN, y: startY })).current;
  const lift = useRef(new Animated.Value(0)).current; // keyboard avoidance
  const translateY = useRef(Animated.add(pan.y, lift)).current;

  const pos = useRef({ x: MARGIN, y: startY }); // last committed position
  const size = useRef({ w: 160, h: 32 }); // measured widget size
  const side = useRef<"left" | "right">("left");

  // PanResponder is created once, so keep the latest values in refs
  const env = useRef({ screenW, screenH, insets });
  env.current = { screenW, screenH, insets };
  const openRef = useRef(open);
  openRef.current = open;

  const clamp = (x: number, y: number) => {
    const { screenW, screenH, insets } = env.current;
    const { w, h } = size.current;
    const minY = insets.top;
    const maxY = Math.max(minY, screenH - insets.bottom - h);
    return {
      x: Math.min(Math.max(x, 0), Math.max(0, screenW - w)),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  const springTo = (p: { x: number; y: number }) => {
    pos.current = p;
    Animated.spring(pan, {
      toValue: p,
      useNativeDriver: false,
      bounciness: 5,
    }).start();
  };

  // Re-anchor whenever the widget changes size (collapse <-> expand)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    size.current = { w, h };
    const x = openRef.current
      ? MARGIN
      : side.current === "left"
        ? MARGIN
        : env.current.screenW - w - MARGIN;
    springTo(clamp(x, pos.current.y));
  };

  const drag = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.stopAnimation((v) => {
          pos.current = clamp(v.x, v.y);
        });
      },
      onPanResponderMove: (_, g) => {
        pan.setValue(clamp(pos.current.x + g.dx, pos.current.y + g.dy));
      },
      onPanResponderRelease: (_, g) => {
        // tap on the collapsed pill -> expand
        if (Math.hypot(g.dx, g.dy) < TAP_SLOP) {
          if (!openRef.current) setOpen(true);
          return;
        }

        const c = clamp(pos.current.x + g.dx, pos.current.y + g.dy);

        if (openRef.current) {
          springTo({ x: MARGIN, y: c.y }); // expanded bar only moves vertically
          return;
        }

        // collapsed pill snaps to the nearest side edge
        const { screenW } = env.current;
        side.current =
          c.x + size.current.w / 2 < screenW / 2 ? "left" : "right";
        springTo({
          x:
            side.current === "left"
              ? MARGIN
              : screenW - size.current.w - MARGIN,
          y: c.y,
        });
      },
    }),
  ).current;

  // ---- keep the input above the keyboard -----------------------------
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (e) => {
      const bottom = pos.current.y + size.current.h;
      const overlap = Math.max(0, bottom - e.endCoordinates.screenY + 8);
      Animated.timing(lift, {
        toValue: -overlap,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      Animated.timing(lift, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [lift]);

  // ---- actions -------------------------------------------------------
  const close = () => {
    Keyboard.dismiss();
    setOpen(false);
  };

  const go = () => {
    const raw = value.trim();
    if (!raw) return;
    router.push((raw.startsWith("/") ? raw : `/${raw}`) as never); // unknown paths hit +not-found
    setValue("");
    close();
  };

  // ---- render --------------------------------------------------------
  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        open ? [styles.bar, { width: screenW - MARGIN * 2 }] : styles.pillBox,
        { transform: [{ translateX: pan.x }, { translateY }] },
      ]}
    >
      {open ? (
        <>
          <View {...drag.panHandlers} style={styles.grip} hitSlop={8}>
            <View style={styles.gripLine} />
            <View style={styles.gripLine} />
            <View style={styles.gripLine} />
          </View>

          <TextInput
            value={value}
            onChangeText={setValue}
            onSubmitEditing={go}
            placeholder={pathname}
            placeholderTextColor="#8A8A99"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            style={styles.input}
          />

          <Pressable onPress={go} style={styles.goButton} hitSlop={6}>
            <Text style={styles.goText}>Go</Text>
          </Pressable>
          <Pressable onPress={close} style={styles.closeButton} hitSlop={6}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </>
      ) : (
        <View {...drag.panHandlers} style={styles.pill}>
          <Text style={styles.pillText} numberOfLines={1}>
            DEV {pathname}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 10,
  },

  // collapsed
  pillBox: {
    maxWidth: 240,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(20,20,30,0.88)",
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // expanded
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 14,
    backgroundColor: "#14141E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  grip: {
    width: 24,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  gripLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#8A8A99",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#24242F",
    color: "#FFFFFF",
    fontSize: 14,
  },
  goButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#6F72D3",
    alignItems: "center",
    justifyContent: "center",
  },
  goText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  closeButton: {
    height: 40,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#8A8A99",
    fontSize: 16,
  },
});
