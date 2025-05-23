let pgSyncChannel;
if (typeof window !== "undefined") {
  pgSyncChannel = new BroadcastChannel("pg-sync");
}
export default pgSyncChannel;