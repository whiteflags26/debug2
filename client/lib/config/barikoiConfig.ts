import { setConfig } from "barikoiapis";

setConfig({
  apiKey: process.env.NEXT_PUBLIC_BARIKOI_API_KEY!,
  version: "v2",
});