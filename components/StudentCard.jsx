import React from "react";
import { StyleSheet } from "react-native";
import { Button, Card } from "react-native-paper";

/**
 * @typedef {} props
 */

/** @type {React.FC<{name: string, parentName: string, rawUrl: string, onCancel: (props: {name: string, parentName: string, rawUrl: string}) => any, onCheckout: (props: {name: string, parentName: string, rawUrl: string}) => any}>} */
const StudentCard = ({ name, parentName, rawUrl, onCancel, onCheckout }) => {
  return (
    <Card style={styles.card}>
      <Card.Title title={name} subtitle={parentName} />
      <Card.Actions>
        <Button onPress={() => onCancel({ name, parentName, rawUrl })}>
          Cancel
        </Button>
        <Button onPress={() => onCheckout({ name, parentName, rawUrl })}>
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
