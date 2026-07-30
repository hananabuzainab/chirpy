import type { MigrationConfig } from "drizzle-orm/migrator";
process.loadEnvFile();
export type APIConfig = {
  fileserverHits: number;
   dbURL:string;
 platform:string;
 jwtSecret: string;
polkaKey:string;
};
export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {

  migrationsFolder:"./src/db/migrations"

};


export const config = {


api:{

fileserverHits:0,
platform:envOrThrow("PLATFORM"),
jwtSecret:envOrThrow("JWT_SECRET"),
polkaKey:envOrThrow("POLKA_KEY")
},


db:{

url:envOrThrow("DB_URL"),

migrationConfig

}


};

function envOrThrow(key:string):string{

 const value = process.env[key];

 if(!value){
   throw new Error(`${key} is missing`);
 }

 return value;

}
