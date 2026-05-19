import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

type Row = {
  id: string;
  content: string;
  created_at: string;
  handle: string;
  display_name: string;
};

export function FollowingScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    const followingIds = (follows ?? []).map((f) => f.following_id);
    const feedAuthorIds = [...new Set([...followingIds, user.id])];
    const { data: posts } = await supabase
      .from("posts")
      .select("id, content, created_at, author_id")
      .is("parent_id", null)
      .in("author_id", feedAuthorIds)
      .order("created_at", { ascending: false })
      .limit(50);
    const list = posts ?? [];
    const authorIds = [...new Set(list.map((p) => p.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, handle, display_name")
      .in("id", authorIds);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p] as const));
    setRows(
      list.map((p) => {
        const pr = byId.get(p.author_id);
        return {
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          handle: pr?.handle ?? "?",
          display_name: pr?.display_name ?? "",
        };
      }),
    );
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#00e676" />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          tintColor="#00e676"
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.h1}>Following</Text>
          <Text style={styles.muted}>Newest first · no ranking</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>{message ?? "No posts yet."}</Text>
      }
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.meta}>
            {item.display_name || item.handle} @{item.handle}
          </Text>
          <Text style={styles.body}>{item.content}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" },
  list: { padding: 16, paddingBottom: 32, backgroundColor: "#0a0a0a", flexGrow: 1 },
  header: { marginBottom: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "#fafafa" },
  muted: { color: "#a3a3a3", marginTop: 4 },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a2a2a",
    paddingVertical: 12,
  },
  meta: { color: "#a3a3a3", fontSize: 13, marginBottom: 4 },
  body: { color: "#fafafa", fontSize: 15, lineHeight: 22 },
});
