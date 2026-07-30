import { pgTable, timestamp, varchar, uuid, text ,boolean} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  email: varchar("email", { length: 256 }).unique().notNull(),
hashed_password:varchar("hashed_password",{
length:256,}).notNull().default("unset"),

isChirpyRed:boolean("is_chirpy_red")
.notNull()
.default(false),

}
);

export type NewUser = typeof users.$inferInsert;


export const chirps = pgTable("chirps", {

id: uuid("id")
.primaryKey()
.defaultRandom(),


createdAt: timestamp("created_at")
.notNull()
.defaultNow(),


updatedAt: timestamp("updated_at")
.notNull()
.defaultNow()
.$onUpdate(() => new Date()),


body: text("body")
.notNull(),


userId: uuid("user_id")
.notNull()
.references(() => users.id, {
 onDelete:"cascade"
})

});
export type NewChirp = typeof chirps.$inferInsert;



export const refreshTokens = pgTable(
"refresh_tokens",
{
 token: varchar("token", {length:256})
 .primaryKey(),

 createdAt: timestamp("created_at")
 .notNull()
 .defaultNow(),

 updatedAt: timestamp("updated_at")
 .notNull()
 .defaultNow()
 .$onUpdate(()=>new Date()),


 userId: uuid("user_id")
 .references(
 ()=>users.id,
 {
 onDelete:"cascade"
 }
 )
 .notNull(),


 expiresAt: timestamp("expires_at")
 .notNull(),


 revokedAt: timestamp("revoked_at")

}
);

export type NewrefreshToken = typeof refreshTokens.$inferInsert;
