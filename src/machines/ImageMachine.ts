import { assign, createMachine } from "xstate";
import { pure, sendParent } from "xstate/lib/actions";

type ShapeEvent =
  | { type: "BIGGER"; top: number; left: number }
  | { type: "SMALLER"; top: number; left: number }
  | { type: "SELECT_SHAPE" }
  | { type: "DESELECT_SHAPE" }
  | { type: "SET_COLOR"; color: string }
  | { type: "done.invoke.fetchData" }
  | { type: "REGISTER_IS_POINT_IN_SHAPE"; isPointInShape: any }
  | { type: "done.invoke.imageUpload"; data: any }
  | {
      type: "CHECK_POINT_IN_SHAPE";
      zoom: number;
      offset: number;
      pos: [number, number];
    };

interface ImageContext {
  x: number;
  y: number;
  scale: number;
  id: string;
  image: string;
  width: number;
  height: number;
}

type TShapeCommon = {
  x: number;
  y: number;
  scale: number;
  selected?: boolean;
};

export type TShapeImage = TShapeCommon & {
  image: string;
  width: number;
  height: number;
};

const ImageMachine = createMachine<ImageContext, ShapeEvent>(
  {
    key: "shape",
    initial: "unselected",
    context: {
      x: 0,
      y: 0,
      scale: 1,
      id: "",
      image: "",
      width: 0,
      height: 0,
    },
    states: {
      unselected: {
        on: {
          SELECT_SHAPE: {
            target: "selected",
            actions: ["notifyParentShapeSelected"],
          },
        },
      },
      selected: {
        on: {
          DESELECT_SHAPE: {
            target: "unselected",
            actions: ["notifyParentShapeDeselected"],
          },
        },
      },
    },
    on: {
      SET_COLOR: {
        actions: ["assignColor", "notifyParentShapeUpdated"],
      },
      BIGGER: {
        actions: ["makeShapeBigger", "notifyParentShapeUpdated"],
      },
      SMALLER: {
        actions: ["makeShapeSmaller", "notifyParentShapeUpdated"],
      },
    },
  },
  {
    actions: {
      notifyParentShapeSelected: sendParent((ctx) => ({
        type: "SHAPE_SELECTED",
        id: ctx.id,
      })),
      notifyParentShapeDeselected: sendParent((ctx) => ({
        type: "SHAPE_DESELECTED",
        id: ctx.id,
      })),
      makeShapeBigger: assign((ctx, event) => {
        if (event.type !== "BIGGER") return ctx;
        const { x, y, scale } = ctx;
        const { top, left } = event;
        const nextScale = scale * 1.2;
        return {
          ...ctx,
          x: left + (x - left) * (nextScale / scale),
          y: top + (y - top) * (nextScale / scale),
          scale: nextScale,
        };
      }),
      makeShapeSmaller: assign((ctx, event) => {
        if (event.type !== "SMALLER") return ctx;
        const { x, y, scale } = ctx;
        const { top, left } = event;
        const nextScale = scale / 1.2;
        return {
          ...ctx,
          x: left + (x - left) * (nextScale / scale),
          y: top + (y - top) * (nextScale / scale),
          scale: nextScale,
        };
      }),
      notifyParentShapeUpdated: sendParent((ctx) => ({
        type: "SHAPE_UPDATED",
        id: ctx.id,
        shapeData: {
          x: 0,
          y: ctx.y,
          image: ctx.image,
          width: ctx.width,
          height: ctx.height,
          scale: ctx.scale,
          id: ctx.id,
        },
      })),
    },
  }
);

export default ImageMachine;
