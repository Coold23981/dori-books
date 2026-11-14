import {getChatGPTUser} from "../app/chatgpt-auth";import {config} from "./server";
export async function isAdmin(){const user=await getChatGPTUser();return !!user&&!!config().ADMIN_USER_ID&&user.userId===config().ADMIN_USER_ID}
export function safeSlug(value:unknown){return typeof value==="string"&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)}
