import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { supabase } from "../lib/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

export function UserProfileScreen({ route }: Props) {
  const handleParam = route.params.handle.trim().toLowerCase();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    handle: string;
    display_name: string;
    bio: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setSelfId(user?.id ?? null);

    const { data: p, error } = await supabase
      .from("profiles")
      .select("id, handle, display_name, bio")
      .eq("handle", handleParam)
      .maybeSingle();

    if (error || !p) {
      setProfile(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProfile(p);

    if (user && user.id !== p.id) {
      const { data: row } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", p.id)
        .maybeSingle();
      setFollowing(Boolean(row));
    } else {
      setFollowing(false);
    }
    setLoading(false);
  }, [handleParam]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleFollow() {
    if (!profile || !selfId || selfId === profile.id || busy) return;
    setBusy(true);
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", selfId)
        .eq("following_id", profile.id);
      if (!error) setFollowing(false);
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: selfId,
        following_id: profile.id,
      });
      if (!error) setFollowing(true);
    }
    setBusy(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#00e676" />
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>No user @{handleParam}</Text>
      </View>
    );
  }

  const isSelf = selfId === profile.id;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {profile.display_name?.trim() || profile.handle}
      </Text>
      <Text style={styles.handle}>@{profile.handle}</Text>
      {profile.bio?.trim() ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : (
        <Text style={styles.muted}>No bio yet.</Text>
      )}
      {!isSelf && selfId ? (
        <Pressable
          style={[styles.follow, following && styles.following]}
          onPress={() => void toggleFollow()}
          disabled={busy}
        >
          <Text style={[styles.followText, following && styles.followingText]}>
            {following ? "Following" : "Follow"}
          </Text>
        </Pressable>
      ) : isSelf ? (
        <Text style={styles.muted}>This is you — edit under the Profile tab.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 24,
  },
  scroll: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", color: "#fafafa" },
  handle: { color: "#00e676", marginTop: 6, fontSize: 16 },
  bio: { color: "#fafafa", marginTop: 16, fontSize: 15, lineHeight: 22 },
  muted: { color: "#737373", marginTop: 12 },
  err: { color: "#f87171", textAlign: "center" },
  follow: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#00e676",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  following: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  followText: { color: "#000", fontWeight: "700" },
  followingText: { color: "#fafafa" },
});
