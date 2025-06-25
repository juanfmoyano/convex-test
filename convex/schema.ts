import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { transactionsTable } from "./schema/transactions";
import { freeClaimsTable } from "./schema/freeClaims";
 
const schema = defineSchema({
	...authTables,
	transactions: transactionsTable,
	freeClaims: freeClaimsTable
});
 
export default schema;