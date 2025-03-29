import SchematicEmbed from "./SchematicEmbed";
import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";

async function SchematicComponent({ componentId }: { componentId?: string }) {
  if (!componentId) {
    return null;
  }

  const accessToken = await getTemporaryAccessToken();

  if (!accessToken) {
    // TODO: Add toast notification
    throw new Error("No access token found for user");
  }
  return <SchematicEmbed accessToken={accessToken} componentId={componentId} />;
}

export default SchematicComponent;
