import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card } from "react-native-paper";
import { IStudent } from "../App";

type props = {
  onCancel: (student: IStudent) => any;
  onCheckout: (student: IStudent) => any;
} & IStudent;

const StudentCard = ({
  name,
  parentName,
  rawUrl,
  onCancel,
  onCheckout,
  isLoading,
}: props) => {
  return (
    <Card style={styles.card}>
      <Card.Title title={name} subtitle={parentName} />
      <Card.Actions>
        <Button
          disabled={isLoading ? true : false}
          onPress={() => onCancel({ name, parentName, rawUrl })}
        >
          Cancel
        </Button>
        <Button
          disabled={isLoading ? true : false}
          onPress={() => onCheckout({ name, parentName, rawUrl })}
        >
          Checkout
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "tomato",
  },
});

export default StudentCard;
