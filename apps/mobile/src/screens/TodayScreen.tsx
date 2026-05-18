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

type Leader = {
  post_id: string;
  content: string;
  score: number;
  handle: string;
  display_name: string;
};

export function TodayScreen() {
  const [rows, setRows] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: rpcErr } = await supabase.rpc("leaderboard_today_utc", {
      p_limit: 50,
    });
    if (rpcErr) {
      setError(rpcErr.message);
      setRows([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const board = (data ?? []) as {
      post_id: string;
      author_id: string;
      content: string;
      created_at: string;
      score: number;
    }[];
    const authorIds = [...new Set(board.map((b) => b.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, handle, display_name")
      .in("id", authorIds);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p] as const));
    setRows(
      board.map((b) => {
        const pr = byId.get(b.author_id);
        return {
          post_id: b.post_id,
          content: b.content,
          score: Number(b.score),
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
      keyExtractor={(item) => item.post_id}
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
          <Text style={styles.h1}>Today (UTC)</Text>
          <Text style={styles.muted}>
            Global UTC day · score = likes + replies (no reposts).
          </Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>
          {error ? "" : "No ranked posts yet today."}
        </Text>
      }
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.score}>score {item.score.toFixed(0)}</Text>
          </View>
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
  err: { color: "#f87171", marginTop: 8 },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a2a2a",
    paddingVertical: 12,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  score: {
    color: "#00e676",
    fontSize: 12,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  meta: { color: "#a3a3a3", fontSize: 13, marginBottom: 4 },
  body: { color: "#fafafa", fontSize: 15, lineHeight: 22 },
});
