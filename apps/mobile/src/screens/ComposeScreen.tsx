import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { POST_MAX_LENGTH } from "@chirp/shared";
import { supabase } from "../lib/supabase";

function extFromMime(mime: string) {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function ComposeScreen() {
  const [text, setText] = useState("");
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function pickImage() {
    setMsg(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setMsg("Photo library permission is required to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.88,
    });
    if (result.canceled || !result.assets[0]) return;
    const a = result.assets[0];
    const mime = a.mimeType ?? "image/jpeg";
    if (mime.includes("heic") || mime.includes("heif")) {
      setMsg("Please pick a JPEG or PNG (HEIC is not supported on the feed yet).");
      return;
    }
    setAsset(a);
  }

  async function post() {
    setMsg(null);
    const trimmed = text.trim();
    if (!trimmed && !asset) {
      setMsg("Write something or attach one photo.");
      return;
    }
    if (trimmed.length > POST_MAX_LENGTH) {
      setMsg(`Max ${POST_MAX_LENGTH} characters.`);
      return;
    }
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMsg("Not signed in.");
      setBusy(false);
      return;
    }

    const { data: post, error: postErr } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        content: trimmed,
        parent_id: null,
      })
      .select("id")
      .single();

    if (postErr || !post) {
      setMsg(postErr?.message ?? "Could not create post.");
      setBusy(false);
      return;
    }

    if (asset?.uri) {
      try {
        const mime = asset.mimeType ?? "image/jpeg";
        const ext = extFromMime(mime);
        const path = `${user.id}/${post.id}.${ext}`;
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "base64",
        });
        const bytes = decode(base64);
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, bytes, {
            contentType: mime,
            upsert: false,
          });
        if (upErr) {
          await supabase.from("posts").delete().eq("id", post.id);
          setMsg(upErr.message);
          setBusy(false);
          return;
        }
        const { error: mediaErr } = await supabase.from("post_media").insert({
          post_id: post.id,
          kind: "image",
          storage_path: path,
          mime_type: mime,
          duration_seconds: null,
        });
        if (mediaErr) {
          await supabase.storage.from("media").remove([path]);
          await supabase.from("posts").delete().eq("id", post.id);
          setMsg(mediaErr.message);
          setBusy(false);
          return;
        }
      } catch (e) {
        await supabase.from("posts").delete().eq("id", post.id);
        setMsg(e instanceof Error ? e.message : "Upload failed.");
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    setText("");
    setAsset(null);
    setMsg("Posted. Pull to refresh on Following.");
  }

  const left = POST_MAX_LENGTH - text.length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>New post</Text>
      <Text style={styles.muted}>
        Text and/or one photo (JPEG/PNG/WebP). Video: use the web app.
      </Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="What is happening?"
        placeholderTextColor="#737373"
        maxLength={POST_MAX_LENGTH}
        value={text}
        onChangeText={setText}
      />
      <Text style={[styles.count, left < 40 && { color: "#00e676" }]}>
        {left} left
      </Text>
      {asset?.uri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: asset.uri }} style={styles.preview} />
          <Pressable onPress={() => setAsset(null)} style={styles.removeBtn}>
            <Text style={styles.removeText}>Remove photo</Text>
          </Pressable>
        </View>
      ) : null}
      <Pressable style={styles.pickBtn} onPress={() => void pickImage()}>
        <Text style={styles.pickText}>
          {asset ? "Change photo" : "Add photo (optional)"}
        </Text>
      </Pressable>
      {msg ? <Text style={styles.feedback}>{msg}</Text> : null}
      <Pressable
        style={[styles.btn, busy && styles.btnDisabled]}
        onPress={() => void post()}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.btnText}>Post</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#0a0a0a" },
  h1: { fontSize: 22, fontWeight: "700", color: "#fafafa" },
  muted: { color: "#a3a3a3", marginTop: 6, marginBottom: 12 },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 12,
    color: "#fafafa",
    backgroundColor: "#141414",
    textAlignVertical: "top",
  },
  count: { marginTop: 8, fontSize: 12, color: "#a3a3a3" },
  previewWrap: { marginTop: 12 },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    resizeMode: "cover",
  },
  removeBtn: { marginTop: 8 },
  removeText: { color: "#f87171", fontSize: 14 },
  pickBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pickText: { color: "#00e676", fontSize: 14, fontWeight: "600" },
  feedback: { marginTop: 12, color: "#a3a3a3" },
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
