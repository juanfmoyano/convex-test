import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { transactionsTable } from "./schema/transactions";
import { freeClaimsTable } from "./schema/freeClaims";
import { battlesTable } from "./schema/battles";
import { battlesBetsTable } from "./schema/battlesBets";
 
const schema = defineSchema({
	...authTables,
	transactions: transactionsTable,
	freeClaims: freeClaimsTable,
	battles: battlesTable,
	battlesBets: battlesBetsTable
});
 
export default schema;