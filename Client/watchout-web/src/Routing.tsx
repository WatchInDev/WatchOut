import {
  createBrowserRouter,
  createRoutesFromChildren,
  Route,
} from "react-router";
import { Layout } from "@/Layout";
import { EventMap } from "@/features/map/EventMap";
import { EventTypes } from "./features/events/event-types/EventTypes";

export const routing = createBrowserRouter(
  createRoutesFromChildren(
    <Route path="/" element={<Layout />}>
      <Route index element={<EventMap />} />
      <Route path="event-types" element={<EventTypes />} />
    </Route>
  )
);
