type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Get Recipe",
    endpoint: "/api/recipes/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Create Recipe",
    endpoint: "/api/recipes",
    method: "POST",
    fields: { recipe: "input" }, // the lightweight front end constructs the body as follows: take the key of `fields` as a key, and entered value as value
  },
  {
    name: "Update Recipe",
    endpoint: "/api/recipes/:_id",
    method: "PATCH",
    fields: { _id: "input", update: "input" }, // the lightweight front end constructs the body as follows: take the key of `fields` as a key, and entered value as value
  },
  {
    name: "Grant a user access to a Recipe",
    endpoint: "/api/recipe_access_controls/users/:userId/accessibleContent",
    method: "PUT",
    fields: { userId: "input", recipeId: "input" },
  },
  {
    name: "Grant a user access to a Collection",
    endpoint: "/api/collection_access_controls/users/:userId/accessibleContent",
    method: "PUT",
    fields: { userId: "input", _id: "input" },
  },
  {
    name: "Revoke a user's access to a Recipe",
    endpoint: "/api/recipe_access_controls/users/:userId/accessibleContent/:recipeId",
    method: "DELETE",
    fields: { userId: "input", recipeId: "input" },
  },
  {
    name: "Revoke a user access to a Collection",
    endpoint: "/api/collection_access_controls/users/:userId/accessibleContent/:_id",
    method: "DELETE",
    fields: { userId: "input", _id: "input" },
  },
  {
    name: "Create Recipe Collection",
    endpoint: "/api/recipe_collections",
    method: "POST",
    fields: { name: "input" },
  },
  {
    name: "Add Recipe to Collection",
    endpoint: "/api/recipe_collections/:_id/recipes",
    method: "PUT",
    fields: { _id: "input", recipeId: "input" },
  },

  {
    name: "Get Recipes in Collection",
    endpoint: "/api/recipe_collections/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Create Discussion Thread",
    endpoint: "/api/discussion_threads",
    method: "POST",
    fields: { recipeId: "input", name: "input" },
  },
  {
    name: "Add Remark to Discussion Thread",
    endpoint: "/api/discussion_threads/:discussionId/remarks",
    method: "POST",
    fields: { discussionId: "input", remark: "input" },
  },
  {
    name: "Get Discussion Thread Contents",
    endpoint: "/api/discussion_threads/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
