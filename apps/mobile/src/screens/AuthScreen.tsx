import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { POST_MAX_LENGTH } from "@chirp/shared";
import { supabase } from "../lib/supabase";

export function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) onAuthed();
    });
    return () => {
      cancelled = true;
    };
  }, [onAuthed]);

  async function submit() {
    setError(null);
    setBusy(true);
    if (mode === "login") {
      const { error: e } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (e) setError(e.message);
      else onAuthed();
    } else {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) setError(e.message);
      else onAuthed();
    }
    setBusy(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Chirp</Text>
      <Text style={styles.sub}>
        {mode === "login" ? "Log in" : "Create account"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#737373"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#737373"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <Pressable
        style={[styles.btn, busy && styles.btnDisabled]}
        onPress={() => void submit()}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.btnText}>
            {mode === "login" ? "Sign in" : "Sign up"}
          </Text>
        )}
      </Pressable>
      <Pressable
        style={styles.switch}
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text style={styles.switchText}>
          {mode === "login"
            ? "Need an account? Register"
            : "Have an account? Log in"}
        </Text>
      </Pressable>
      <Text style={styles.hint}>
        Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in
        apps/mobile/.env (see .env.example).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#0a0a0a" },
  title: { fontSize: 32, fontWeight: "700", color: "#fafafa" },
  sub: { marginTop: 8, marginBottom: 24, fontSize: 18, color: "#a3a3a3" },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#fafafa",
    backgroundColor: "#141414",
  },
  err: { color: "#f87171", marginBottom: 12 },
  btn: {
    backgroundColor: "#00e676",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#000", fontWeight: "700" },
  switch: { marginTop: 16 },
  switchText: { color: "#00e676", textAlign: "center" },
  hint: { marginTop: 32, fontSize: 11, color: "#525252", textAlign: "center" },
});
