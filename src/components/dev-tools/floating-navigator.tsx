// src/components/dev-tools/floating-navigator.tsx
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DevMenu from "./dev-menu";
import { MARGIN, TAP_SLOP, styles } from "./styles";

/**
 * - Collapsed: a small pill you can drag anywhere; it snaps to the left/right edge.
 *   Tap it to expand.
 * - Expanded: a path input. Drag it by the grip on the left. Type a route
 *   (e.g. /onboarding, /(app)/home, /profile?id=1) and press Go.
 *   The three-dot button opens the dev menu (session, profile, onboarding).
 */
export default function FloatingNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Re-anchor whenever the widget changes size (collapse <-> expand, menu open/close).
  // clamp() also pulls it back on screen when the menu makes it taller.
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
    setMenuOpen(false);
    setOpen(false);
  };

  const toggleMenu = () => {
    Keyboard.dismiss(); // the menu needs room, and its buttons need taps
    setMenuOpen((m) => !m);
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
          <View style={styles.row}>
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
            <Pressable
              onPress={toggleMenu}
              accessibilityRole="button"
              accessibilityLabel="Dev menu"
              style={[styles.iconButton, menuOpen && styles.iconButtonActive]}
              hitSlop={6}
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </Pressable>
            <Pressable onPress={close} style={styles.closeButton} hitSlop={6}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {menuOpen ? <DevMenu /> : null}
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
