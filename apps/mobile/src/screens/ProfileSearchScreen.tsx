import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

type Row = { id: string; handle: string; display_name: string };

function sanitizeIlike(q: string) {
  return q.replace(/\\/g, "").replace(/%/g, "").replace(/_/g, "").trim();
}

export function ProfileSearchScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 320);
    return () => clearTimeout(t);
  }, [q]);

  const search = useCallback(async () => {
    const term = sanitizeIlike(debounced);
    if (term.length < 1) {
      setRows([]);
      return;
    }
    setLoading(true);
    const pattern = `%${term}%`;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, handle, display_name")
      .ilike("handle", pattern)
      .order("handle", { ascending: true })
      .limit(40);
    setLoading(false);
    if (error) {
      setRows([]);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, [debounced]);

  useEffect(() => {
    void search();
  }, [search]);

  const openProfile = useCallback(
    (handle: string) => {
      const parent = navigation.getParent();
      if (parent && "navigate" in parent) {
        (parent.navigate as (name: string, params: { handle: string }) => void)(
          "UserProfile",
          { handle },
        );
      }
    },
    [navigation],
  );

  const emptyHint = useMemo(
    () =>
      debounced.trim().length < 1
        ? "Type at least one character to search by username."
        : loading
          ? "Searching…"
          : "No usernames match.",
    [debounced, loading],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Search</Text>
      <Text style={styles.muted}>Find people by @handle (partial match).</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search username"
        placeholderTextColor="#737373"
        style={styles.input}
      />
      {loading && debounced.trim().length > 0 ? (
        <ActivityIndicator color="#00e676" style={{ marginTop: 12 }} />
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{emptyHint}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => openProfile(item.handle)}
          >
            <Text style={styles.name}>
              {item.display_name?.trim() || item.handle}
            </Text>
            <Text style={styles.handle}>@{item.handle}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0a0a0a", padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "#fafafa" },
  muted: { color: "#a3a3a3", marginTop: 6, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 12,
    color: "#fafafa",
    backgroundColor: "#141414",
  },
  list: { marginTop: 12, flex: 1 },
  empty: { color: "#737373", marginTop: 16 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a2a2a",
  },
  name: { color: "#fafafa", fontSize: 16, fontWeight: "600" },
  handle: { color: "#00e676", fontSize: 14, marginTop: 2 },
});
