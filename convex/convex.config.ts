import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
app.use(aggregate, { name: "incomingAggregate" });
app.use(aggregate, { name: "outgoingAggregate" });
export default app;