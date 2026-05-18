import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BIO_MAX, DISPLAY_NAME_MAX, isValidHandle } from "@chirp/shared";
import { supabase } from "../lib/supabase";

export function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("handle, display_name, bio")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && profile) {
        setHandle(profile.handle);
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setMessage(null);
    setError(null);
    const nextHandle = handle.trim().toLowerCase();
    if (!isValidHandle(nextHandle)) {
      setError(
        "Username: 2–30 chars, letters, numbers, underscores only.",
      );
      return;
    }
    const name = displayName.trim();
    if (name.length > DISPLAY_NAME_MAX) {
      setError(`Display name max ${DISPLAY_NAME_MAX} characters.`);
      return;
    }
    const bioText = bio.trim();
    if (bioText.length > BIO_MAX) {
      setError(`Bio max ${BIO_MAX} characters.`);
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setSaving(false);
      return;
    }
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        handle: nextHandle,
        display_name: name,
        bio: bioText,
      })
      .eq("id", user.id);
    setSaving(false);
    if (upErr) {
      if (
        upErr.code === "23505" ||
        upErr.message?.toLowerCase().includes("duplicate")
      ) {
        setError("That username is taken.");
      } else {
        setError(upErr.message);
      }
      return;
    }
    setHandle(nextHandle);
    setMessage("Saved.");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#00e676" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.h1}>Profile</Text>
      <Text style={styles.muted}>You · how others see you</Text>

      <Text style={styles.label}>Email (sign-in)</Text>
      <Text style={styles.readonly}>{email ?? "—"}</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        placeholder="handle"
        placeholderTextColor="#737373"
      />

      <Text style={styles.label}>Display name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={DISPLAY_NAME_MAX}
        style={styles.input}
        placeholder="Shown on posts"
        placeholderTextColor="#737373"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        maxLength={BIO_MAX}
        multiline
        style={[styles.input, styles.bioInput]}
        placeholder="Short bio"
        placeholderTextColor="#737373"
      />
      <Text style={styles.count}>
        {BIO_MAX - bio.length} left
      </Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}
      {message ? <Text style={styles.ok}>{message}</Text> : null}
      <Pressable
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={() => void save()}
        disabled={saving}
      >
        <Text style={styles.btnText}>{saving ? "Saving…" : "Save changes"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  scroll: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "700", color: "#fafafa" },
  muted: { color: "#a3a3a3", marginTop: 6, marginBottom: 16 },
  label: { color: "#a3a3a3", fontSize: 13, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 12,
    color: "#fafafa",
    backgroundColor: "#141414",
  },
  bioInput: { minHeight: 88, textAlignVertical: "top" },
  count: { color: "#737373", fontSize: 12, marginTop: 4 },
  readonly: { color: "#fafafa", fontSize: 15, marginBottom: 4 },
  err: { color: "#f87171", marginTop: 8 },
  ok: { color: "#00e676", marginTop: 8 },
  btn: {
    marginTop: 16,
    backgroundColor: "#00e676",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#000", fontWeight: "700" },
});
