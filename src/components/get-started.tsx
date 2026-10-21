// import { Pressable, StyleSheet, View } from "react-native";
// import { ThemedText } from "./themed-text";
// import { Image } from "expo-image";

// export default function GetStarted() {
//   return (
//     <View className="bg-black">
//       <ThemedText type="subtitle" themeColor="textSecondary">
//         We'll personalise your budgeting experience under a minute
//       </ThemedText>
//       <Pressable className="p-2 rounded-2xl">
//         <ThemedText type="default">Lets Get Started</ThemedText>
//       </Pressable>
//       <View>
//         <Image
//           source={require("@/assets/images/logo-glow.png")}
//           style={style.image}
//         />
//       </View>
//     </View>
//   );
// }

// const style = StyleSheet.create({
//   image: {
//     position: "absolute",
//     bottom: 0,
//     width: 200,
//     height: "auto",
//   },
// });

import { useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";

const COLORS = {
  white: "#FFFFFF",
  icon: "#5B5BD6",
  body: "#6E6E80",
  ink: "#111111",
  bandLight: "#cddbef",
  bandMid: "#84a5d8",
  panel: "#094CB2",
  knob: "#DCDCDC",
};

const TRACK_TRAVEL = 46; // how far the knob can be dragged upward

// React Native Icon component

function BudgetIcon() {
  return (
    <Svg width={138} height={142} viewBox="0 0 138 142" fill="none">
      <Path
        d="M125.218 103.144h-17.856v-49.57c0-13.01-10.285-23.592-22.923-23.592H39.261V14.697c0-2.45-1.931-4.438-4.313-4.438-2.38 0-4.312 1.988-4.312 4.438v15.284H12.784c-2.381 0-4.313 1.987-4.313 4.438 0 2.45 1.932 4.437 4.313 4.437h17.852v49.571c0 13.009 10.284 23.592 22.927 23.592h45.174v15.284c0 2.45 1.929 4.437 4.312 4.437 2.384 0 4.313-1.987 4.313-4.437v-15.284h17.856c2.384 0 4.313-1.988 4.313-4.438 0-2.45-1.929-4.437-4.313-4.437zm-71.655 0c-7.886 0-14.302-6.602-14.302-14.717v-49.57h45.178c7.884 0 14.298 6.601 14.298 14.716v49.571H53.563z"
        fill="#595BD4"
      />
      <Path
        d="M72.578 75.456a9.85 9.85 0 00-4.923 1.316.75.75 0 10.751 1.3 8.36 8.36 0 11-1.716 1.315.75.75 0 10-1.058-1.063 9.847 9.847 0 106.946-2.867z"
        fill="#595BD4"
      />
      <Path
        d="M73.393 88.268H71.51a1.107 1.107 0 01-1.11-1.107.75.75 0 00-1.5 0 2.61 2.61 0 002.607 2.607h.193v1.438a.75.75 0 101.5 0v-1.438h.191a2.607 2.607 0 100-5.214H71.51a1.108 1.108 0 010-2.215h1.883a1.108 1.108 0 011.107 1.107.75.75 0 101.5 0 2.61 2.61 0 00-2.607-2.607H73.2V79.4a.75.75 0 00-1.5 0v1.439h-.19a2.608 2.608 0 000 5.215h1.883a1.107 1.107 0 010 2.214zm17.024-23.631a.75.75 0 00-.4 1.445c2.029.564 2.486 1.2 2.486 1.372 0 .626-2.935 2.094-8.625 2.094-5.69 0-8.626-1.468-8.626-2.094 0-.626 2.934-2.094 8.626-2.094 1.346-.005 2.69.09 4.023.283a.75.75 0 00.221-1.485 29.116 29.116 0 00-4.244-.3c-4.877 0-10.126 1.125-10.126 3.594v5.835c0 2.469 5.249 3.594 10.126 3.594 3.278 0 6.718-.511 8.625-1.595v.918c0 .626-2.935 2.094-8.625 2.094-.653 0-1.289-.02-1.9-.06a.759.759 0 00-.8.7.75.75 0 00.7.8c.645.042 1.314.064 2 .064 3.278 0 6.718-.511 8.625-1.6v.918c0 .626-2.935 2.1-8.625 2.1h-.447a.78.78 0 00-.772.727.752.752 0 00.728.773h.499c3.278 0 6.718-.512 8.625-1.6v.918c0 .626-2.935 2.094-8.625 2.094a.75.75 0 000 1.5c3.278 0 6.718-.512 8.625-1.595v.991c0 .626-2.935 2.094-8.625 2.094h-.269a.794.794 0 00-.758.742.75.75 0 00.742.758h.285C88.751 88.625 94 87.5 94 85.031V67.454c0-.83-.622-1.992-3.583-2.817zm-6.542 6.411c3.278 0 6.718-.511 8.625-1.595v.918c0 .626-2.935 2.1-8.625 2.1-5.69 0-8.626-1.469-8.626-2.1v-.918c1.907 1.084 5.351 1.595 8.626 1.595zm0 4.335c-5.692 0-8.626-1.468-8.626-2.094v-.918c1.907 1.084 5.346 1.6 8.626 1.6 3.28 0 6.718-.511 8.625-1.6v.918c0 .626-2.935 2.094-8.625 2.094zM61.8 89.28c-.264.01-.53.016-.8.016-7.95 0-13.5-4.561-13.5-11.091 0-5.325 3.6-13.2 8.969-16.435.073-.045.134-.1.2-.15H62.8a.75.75 0 100-1.5h-5.185a2.25 2.25 0 00-.326-1.626c-2.535-3.927-3.028-5.694-2.936-6.152.01.006.02.008.032.007 1.126.008 2.245.178 3.323.506 1.043.317 2.125.485 3.214.5 1.232-.03 2.455-.21 3.643-.538a13.58 13.58 0 012.883-.468c-.027.565-.587 2.234-2.524 5.54H59.2a.75.75 0 000 1.5h5.062c-.037.28-.02.564.048.837a2.41 2.41 0 001.133 1.486 18.355 18.355 0 016.348 7.069.748.748 0 001.254.126.75.75 0 00.063-.843 19.853 19.853 0 00-6.9-7.643.927.927 0 01-.443-.563.76.76 0 01.091-.591c3.764-6.262 3.156-7.337 2.9-7.8a1.254 1.254 0 00-1.132-.625c-1.15.033-2.291.205-3.4.511-1.076.3-2.184.468-3.3.5-.96-.017-1.913-.17-2.83-.453a13.308 13.308 0 00-3.707-.556 1.426 1.426 0 00-1.335.725c-.252.463-.922 1.693 2.979 7.735a.76.76 0 01.109.6.931.931 0 01-.444.581C49.9 63.982 46 72.471 46 78.205 46 85.5 52.31 90.8 61 90.8c.288 0 .574-.006.858-.018a.75.75 0 10-.059-1.5l.001-.002z"
        fill="#595BD4"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  /** "Login / Sign up with us" pressed: send the user to the auth screens */
  onLogin?: () => void;
  /**
   * "Continue locally" pressed, or the knob dragged all the way up:
   * start as a guest with data kept on this device
   */
  onContinueLocally?: () => void;
};

export default function GetStarted({
  onLogin = () => {},
  onContinueLocally = () => {},
}: Props) {
  const { height } = useWindowDimensions();

  // keep the latest callback available to the (one-time) PanResponder
  const onContinueRef = useRef(onContinueLocally);
  onContinueRef.current = onContinueLocally;

  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        translateY.setValue(Math.max(-TRACK_TRAVEL, Math.min(0, g.dy)));
      },
      onPanResponderRelease: (_, g) => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
        if (g.dy < -TRACK_TRAVEL * 0.7) onContinueRef.current?.();
      },
    }),
  ).current;

  return (
    <View style={styles.root}>
      {/* ---------- top: white content area ---------- */}
      <View style={[styles.content, { paddingTop: height * 0.2 }]}>
        <BudgetIcon />
        <Text style={styles.subtitle}>
          We'll personalise your budgeting experience under a minute
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={onLogin}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              Login / Sign up with us
            </Text>
          </Pressable>

          <Pressable
            onPress={onContinueLocally}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Continue locally</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Continuing locally keeps your data on this device. You can create an
          account later in Settings.
        </Text>
      </View>

      {/* ---------- bottom: stacked colour bands ---------- */}
      <View style={styles.bottom}>
        <View style={styles.bandLight} />
        <View style={styles.bandMid} />
        <View style={styles.panel} />

        {/* pill handle with draggable knob */}
        <View style={styles.handle} {...panResponder.panHandlers}>
          <Animated.View
            style={[styles.knob, { transform: [{ translateY }] }]}
          />
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  subtitle: {
    marginTop: 28,
    maxWidth: 190,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.body,
  },
  actions: {
    marginTop: 24,
    gap: 12,
    alignItems: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  buttonPrimary: {
    borderColor: COLORS.panel,
    backgroundColor: COLORS.panel,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.ink,
  },
  buttonTextPrimary: {
    color: COLORS.white,
  },
  hint: {
    marginTop: 16,
    maxWidth: 230,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.body,
  },

  bottom: {
    height: 264, // 28 + 43 + 193
  },
  bandLight: {
    height: 28,
    backgroundColor: COLORS.bandLight,
  },
  bandMid: {
    height: 43,
    backgroundColor: COLORS.bandMid,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.panel,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  handle: {
    position: "absolute",
    top: 44,
    alignSelf: "center",
    width: 41,
    height: 97,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 26,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.knob,
  },
});
