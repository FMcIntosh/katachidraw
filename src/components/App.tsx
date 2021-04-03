import * as React from "react"; // for expo
import { FC, useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import CanvasMachine from "../machines/CanvasMachine";
import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";
import Canvas from "./Canvas";

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false,
});

export const App: FC = () => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>(() => Dimensions.get("window"));
  // useMachine(CanvasMachine, { devTools: true });
  useEffect(() => {
    const onChange = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      setDimensions(window);
    };
    Dimensions.addEventListener("change", onChange);
    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  }, []);
  return (
    <>
      <Canvas width={dimensions.width} height={dimensions.height} />
      {/* eslint-disable react/style-prop-object */}
      <StatusBar style="dark" />
    </>
  );
};

export default App;
