"use strict";

/*
 * Supabase browser configuration.
 *
 * The Project URL and publishable key are safe for browser use.
 * Never place a secret key or service_role key in this file.
 */

const SUPABASE_URL = "https://nhwrjkzibdziokphjjsv.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_jGBt4mAqkv0V0j6qbFw07g_KaZoJpCb";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log(
    "Supabase client initialized:",
    Boolean(window.supabaseClient)
);