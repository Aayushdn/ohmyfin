// src/components/dev-tools/dev-menu.tsx
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useDevActions, type DevAction } from "./dev-actions";
import { styles } from "./styles";

export default function DevMenu() {
  const actions = useDevActions();
  const [status, setStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function execute(action: DevAction) {
    setBusyId(action.id);
    try {
      setStatus(await action.run());
    } catch (e) {
      setStatus(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  }

  function press(action: DevAction) {
    if (!action.confirm) {
      void execute(action);
      return;
    }
    Alert.alert(action.label, action.confirm, [
      { text: "Cancel", style: "cancel" },
      {
        text: action.label,
        style: "destructive",
        onPress: () => void execute(action),
      },
    ]);
  }

  return (
    <View style={styles.menu}>
      {actions.map((action, i) => (
        <Pressable
          key={action.id}
          onPress={() => press(action)}
          disabled={busyId !== null}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.menuRow,
            i > 0 && styles.menuRowBorder,
            pressed && styles.menuRowPressed,
            busyId !== null && styles.menuRowDisabled,
          ]}
        >
          <Text
            style={[styles.menuLabel, action.destructive && styles.menuLabelDanger]}
          >
            {action.label}
          </Text>
          <Text style={styles.menuHint}>{action.hint}</Text>
        </Pressable>
      ))}
      {status ? <Text style={styles.menuStatus}>{status}</Text> : null}
    </View>
  );
}
