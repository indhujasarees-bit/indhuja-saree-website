const C = window.INDHUJA_CONFIG;

let db;
let catsEl;

const $ = (id) => document.getElementById(id);

const loginBox = $("login");
const appBox = $("app");
const loginBtn = $("loginBtn");
const logoutBtn = $("logout");
const emailInput = $("email");
const passwordInput = $("password");
const msgBox = $("msg");

const newcatInput = $("newcat");
const addcatBtn = $("addcat");
const categorySelect = $("category");
const catsList = $("cats");

const editIdInput = $("editid");
const codeInput = $("code");
const nameInput = $("pname");
const priceInput = $("price");
const descInput = $("desc");
const photoInput = $("photo");
const saveBtn = $("save");
const clearBtn = $("clear");
const listBox = $("list");

function init() {
  if (!C || !C.SUPABASE_URL || !C.SUPABASE_KEY) {
    msgBox.textContent = "config.js-ல் Supabase URL மற்றும் Key சேர்க்கவும்.";
    return false;
  }

  db = supabase.createClient(
    C.SUPABASE_URL,
    C.SUPABASE_KEY
  );

  return true;
}

function setLogin(showLogin) {
  loginBox.hidden = !showLogin;
  appBox.hidden = showLogin;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* LOGIN */
loginBtn.onclick = async () => {
  if (!init()) return;

  msgBox.textContent = "Login ஆகிறது...";

  const { error } = await db.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value
  });

  if (error) {
    msgBox.textContent = error.message;
    return;
  }

  msgBox.textContent = "";
  setLogin(false);
  await load();
};

logoutBtn.onclick = async () => {
  await db.auth.signOut();
  setLogin(true);
};

/* LOAD ALL SAREES */
async function load() {
  listBox.textContent = "Loading...";

  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listBox.textContent = error.message;
    return;
  }

  const products = data || [];

  const cats = [
    ...new Set(
      products
        .map(item => item.category)
        .filter(Boolean)
    )
  ];

  updateCategorySelect(cats);
  renderCollections(cats, products);
  renderProducts(products);
}

/* CATEGORY DROPDOWN */
function updateCategorySelect(cats) {
  const oldValue = categorySelect.value;

  categorySelect.innerHTML = `
    <option value="">Select collection</option>
    ${cats.map(cat => `
      <option value="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </option>
    `).join("")}
  `;

  if (cats.includes(oldValue)) {
    categorySelect.value = oldValue;
  }
}

/* COLLECTION LIST */
function renderCollections(cats, products) {
  catsEl = catsList;

  if (!cats.length) {
    catsEl.innerHTML = "<p>No collections yet.</p>";
    return;
  }

  catsEl.innerHTML = cats.map(cat => {
    const count = products.filter(
      item => item.category === cat
    ).length;

    return `
      <div class="topcat">
        <span>
          <b>${escapeHtml(cat)}</b>
          <small> (${count} sarees)</small>
        </span>

        <button onclick="renameCat(${JSON.stringify(cat)})">
          RENAME
        </button>
      </div>
    `;
  }).join("");
}

/* ADD NEW COLLECTION */
addcatBtn.onclick = () => {
  const newName = newcatInput.value.trim();

  if (!newName) {
    alert("Collection name type பண்ணு.");
    return;
  }

  const exists = [...categorySelect.options].some(
    option => option.value.toLowerCase() === newName.toLowerCase()
  );

  if (exists) {
    alert("இந்த collection ஏற்கனவே இருக்கு.");
    return;
  }

  const option = document.createElement("option");
  option.value = newName;
  option.textContent = newName;

  categorySelect.appendChild(option);
  categorySelect.value = newName;

  newcatInput.value = "";

  alert(
    "Collection சேர்க்கப்பட்டது. இப்போது Saree details நிரப்பி SAVE SAREE அழுத்து."
  );
};

/* EDIT SAREE */
function edit(item) {
  editIdInput.value = item.id || "";
  codeInput.value = item.code || "";
  nameInput.value = item.name || "";
  priceInput.value = item.price || "";
  descInput.value = item.description || "";

  const exists = [...categorySelect.options].some(
    option => option.value === item.category
  );

  if (!exists && item.category) {
    const option = document.createElement("option");
    option.value = item.category;
    option.textContent = item.category;
    categorySelect.appendChild(option);
  }

  categorySelect.value = item.category || "";

  window.scrollTo({
    top: appBox.offsetTop,
    behavior: "smooth"
  });
}

/* CLEAR FORM */
function clearForm() {
  editIdInput.value = "";
  codeInput.value = "";
  nameInput.value = "";
  priceInput.value = "";
  descInput.value = "";
  photoInput.value = "";
  categorySelect.value = "";
}

clearBtn.onclick = clearForm;

/* SAVE / UPDATE SAREE */
saveBtn.onclick = async () => {
  const id = editIdInput.value;
  const code = codeInput.value.trim();
  const name = nameInput.value.trim();
  const category = categorySelect.value.trim();
  const price = priceInput.value.trim();
  const description = descInput.value.trim();

  if (!code || !name || !category || !price) {
    alert("Code, Saree name, Collection, Price எல்லாம் நிரப்பவும்.");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "SAVING...";

  let imageUrl = null;

  /* UPLOAD IMAGE */
  if (photoInput.files && photoInput.files[0]) {
    const file = photoInput.files[0];

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

    const filePath = `${Date.now()}-${safeName}`;

    const uploadResult = await db.storage
      .from("sarees")
      .upload(filePath, file, {
        upsert: true
      });

    if (uploadResult.error) {
      alert(uploadResult.error.message);
      saveBtn.disabled = false;
      saveBtn.textContent = "SAVE SAREE";
      return;
    }

    imageUrl = db.storage
      .from("sarees")
      .getPublicUrl(filePath)
      .data.publicUrl;
  }

  const row = {
    code: code,
    name: name,
    category: category,
    price: Number(price),
    description: description
  };

  if (imageUrl) {
    row.image_url = imageUrl;
  }

  let result;

  if (id) {
    result = await db
      .from("products")
      .update(row)
      .eq("id", id);
  } else {
    result = await db
      .from("products")
      .insert(row);
  }

  if (result.error) {
    alert(result.error.message);
  } else {
    alert(id ? "Saree updated successfully!" : "Saree added successfully!");
    clearForm();
    await load();
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "SAVE SAREE";
};

/* HIDE / SHOW */
async function toggle(id, currentState) {
  const result = await db
    .from("products")
    .update({
      is_active: !currentState
    })
    .eq("id", id);

  if (result.error) {
    alert(result.error.message);
  } else {
    await load();
  }
}

/* RENAME COLLECTION */
async function renameCat(oldName) {
  const newName = prompt(
    "New collection name:",
    oldName
  );

  if (!newName || newName.trim() === oldName) {
    return;
  }

  const result = await db
    .from("products")
    .update({
      category: newName.trim()
    })
    .eq("category", oldName);

  if (result.error) {
    alert(result.error.message);
  } else {
    alert("Collection renamed successfully!");
    await load();
  }
}

/* SHOW PRODUCTS */
function renderProducts(products) {
  if (!products.length) {
    listBox.innerHTML = "No sarees yet.";
    return;
  }

  listBox.innerHTML = products.map(item => `
    <div class="item">
      <img
        src="${escapeHtml(item.image_url || "")}"
        alt="${escapeHtml(item.name)}"
      >

      <div>
        <b>${escapeHtml(item.name)}</b>
        <small>
          ${escapeHtml(item.code)}
          · ${escapeHtml(item.category)}
          · ₹${escapeHtml(item.price)}
        </small>
      </div>

      <div class="actions">
        <button onclick='edit(${JSON.stringify(item)})'>
          EDIT
        </button>

        <button
          class="${item.is_active ? "hide" : "show"}"
          onclick="toggle('${item.id}', ${item.is_active})"
        >
          ${item.is_active ? "HIDE" : "SHOW"}
        </button>
      </div>
    </div>
  `).join("");
}

/* START */
(async () => {
  if (!init()) return;

  const { data } = await db.auth.getSession();
  if (data.session) {
    setLogin(false);
    await load();
  } else {
    setLogin(true);
  }
})();
