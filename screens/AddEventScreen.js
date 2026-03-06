// screens/AddEventScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Platform } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "../components/Button";
import { useTheme } from "../contexts/ThemeContext";

export default function AddEventScreen({ route, navigation }) {
  const { theme, spacing, fontSize, fontWeight, borderRadius, shadows } = useTheme();
  const cosplayId = route.params?.cosplayId || null;
  const cosplayName = route.params?.cosplayName || "";

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const saveEvent = async () => {
    if (!name.trim()) { alert("Event name is required."); return; }
    if (!date.trim()) { alert("Event date is required."); return; }
    if (!location.trim()) { alert("Event location is required."); return; }
    try {
      await addDoc(collection(db, "events"), {
        name: name.trim(),
        date: date.trim(),
        location: location.trim(),
        description: description.trim(),
        cosplayId: cosplayId,
        createdAt: Date.now(),
      });
      alert("Event saved!");
      navigation.goBack();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save event: " + (err.message || err));
    }
  };

  const FormInput = ({ label, value, onChangeText, placeholder, multiline, ...props }) => (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.text, marginBottom: spacing[2], textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
      <TextInput
        style={{ backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder, borderRadius: borderRadius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[3], fontSize: fontSize.base, color: theme.text, minHeight: multiline ? 90 : undefined, textAlignVertical: multiline ? "top" : "center", ...shadows.sm }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inputPlaceholder}
        multiline={multiline}
        {...props}
      />
    </View>
  );

  const Container = Platform.OS === "web" ? View : SafeAreaView;

  return (
    <Container style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing[4], paddingVertical: spacing[4], paddingBottom: spacing[8] }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: fontSize["3xl"], fontWeight: fontWeight.bold, color: theme.primary, marginBottom: spacing[1] }}>Add Event</Text>
        <Text style={{ fontSize: fontSize.base, color: theme.textSecondary, marginBottom: spacing[6] }}>
          {cosplayName ? `For: ${cosplayName}` : "Save an upcoming cosplay event"}
        </Text>

        <View style={{ backgroundColor: theme.surfaceLight, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[6], ...shadows.md }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: theme.primary, marginBottom: spacing[4] }}>Event Details</Text>
          <FormInput label="Event Name *" value={name} onChangeText={setName} placeholder="e.g. Cosplay Mania 2026" />
          <FormInput label="Date *" value={date} onChangeText={setDate} placeholder="e.g. 2026-07-20 or July 20, 2026" />
          <FormInput label="Location *" value={location} onChangeText={setLocation} placeholder="e.g. SM Mall of Asia Arena" />
          <FormInput label="Description (Optional)" value={description} onChangeText={setDescription} placeholder="Add notes about this event..." multiline={true} />
        </View>

        <View style={{ flexDirection: "row", gap: spacing[2] }}>
          <Button title="Cancel" variant="outline" size="lg" fullWidth={true} onPress={() => navigation.goBack()} style={{ flex: 1 }} />
          <Button title="Save Event" variant="primary" size="lg" fullWidth={true} onPress={saveEvent} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });