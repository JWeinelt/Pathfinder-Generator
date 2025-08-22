let data = { namespace: "", commands: [] };
const availableCustomLists = ["achievements", "biomes", "blockitem", "block", "item", "mods", "namespaces", "dimensions", ""]

document.getElementById('nameSpaceEnter').addEventListener('input', () => {
    let inp = document.getElementById('nameSpaceEnter');
    const regexWhitespace = /\s/;
    if (regexWhitespace.test(inp.value) || inp.value.trim() == "") {
        displayError(inp, "NSEmpty");
    } else removeError(inp);
    data.namespace = inp.value;
    updateJSON();
});

const collapsedCommands = new Set();

const dataMap = new Map();

function updateJSON() {
    validate();
  document.getElementById("jsonOutput").textContent = JSON.stringify(data, null, 2);
    hljs.highlightElement(document.getElementById("jsonOutput"));
}

function addCommand() {
  const cmd = { name: "", description: "", args: [] };
  data.commands.push(cmd);
  renderCommands();
    validate();
}

function removeCommand(index) {
  data.commands.splice(index, 1);
  renderCommands();
}

function toggleCommand(index) {
  if (collapsedCommands.has(index)) {
    collapsedCommands.delete(index);
  } else {
    collapsedCommands.add(index);
  }
  renderCommands();
}

function addArgument(cmdIndex, parentArgs) {
  const arg = { name: "", type: "string", description: "", args: [], suggestion_type: "", suggestions: [], custom_list_name: "" };
  parentArgs.push(arg);
  renderCommands();
}

function removeArgument(cmdIndex, args, argIndex) {
  args.splice(argIndex, 1);
  renderCommands();
}

function renderArgumentFields(cmdIndex, args, parentArgs) {
  return args.map((arg, argIndex) => `
    <div class='relative border border-gray-700 p-2 rounded-lg bg-gray-800 mt-2'>
    <button onclick="removeArgument(${cmdIndex}, data.commands[${cmdIndex}].args${getPath(parentArgs)}, ${argIndex})" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">X</button>
      <input type="text pattern="[a-zA-Z0-9_-]+" required placeholder="Argument Name" value="${arg.name}" 
        onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].name=this.value; updateJSON()"
        class="argNameField rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-9 px-2 py-1 rounded mb-2 bg-gray-800 text-white">

        <div class="relative group inline-block">
          <button class="fas fa-solid fa-circle-info text-blue-500 cursor-help"></button>
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                       bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
            Argument names are internal.<br>They won't be displayed in-game.
          </span>
        </div>


      <textarea placeholder="Description" onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].description=this.value; updateJSON()" class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded mb-2 bg-gray-800 text-white w-full">${arg.description}</textarea>

      <label class="text-white">Argument Type:</label>
      <select onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].type=this.value; updateJSON()" class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded mb-2 bg-gray-800 text-white w-full">
        <option ${arg.type==="string"?"selected":""}>string</option>
        <option ${arg.type==="integer"?"selected":""}>integer</option>
        <option ${arg.type==="decimal"?"selected":""}>decimal</option>
        <option ${arg.type==="list"?"selected":""}>list</option>
        <option ${arg.type==="entity"?"selected":""}>entity</option>
        <option ${arg.type==="coordinate"?"selected":""}>coordinate</option>
      </select>

      <label class="text-white">Pre-defined suggestions:</label>

        <div class="relative group inline-block">
          <button class="fas fa-solid fa-circle-info text-blue-500 cursor-help"></button>
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                       bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
            Define suggestions here, separated by commas (<code>,</code>).<br>
            Pre-defined suggestions are always <b>added</b> to suggestion type values.<br><br>
            If you choose f.ex. "players" as your suggestion type, you may also<br>
            want to display "@s", "@a", etc. as suggestions. You have to define<br>
            them here.
          </span>
        </div>

      <input type="text" placeholder="foo, bar" value="${arg.suggestions}" 
        onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].suggestions= makeList(this.value); updateJSON()"
        class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded mb-2 bg-gray-800 text-white w-full">



      <label class="text-white">Suggestion Type:</label>

        <div class="relative group inline-block">
          <button class="fas fa-solid fa-circle-info text-blue-500 cursor-help"></button>
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                       bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
            With suggestion types you can add a set of<br>
            suggestions to your argument. These types are available:<br>
            • entities: Will display entity types (e.g. sheep, wolf, ...)<br>
            • players: Displays all players (@s, @a, ... not included!)<br>
            • coordinates: Displays a coordinate (~ + the current coords of the player)<br>
            • list: Use of custom lists and dynamic suggestions
          </span>
        </div>
      <select onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].suggestion_type=this.value; updateJSON()" class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded mb-2 bg-gray-800 text-white w-full">
        <option value="">(none)</option>
        <option ${arg.suggestion_type==="list"?"selected":""}>list</option>
        <option ${arg.suggestion_type==="players"?"selected":""}>players</option>
        <option ${arg.suggestion_type==="entities"?"selected":""}>entities</option>
        <option ${arg.suggestion_type==="coordinates"?"selected":""}>coordinates</option>
      </select>



      <label class="text-white">List name:</label>

        <div class="relative group inline-block">
          <button class="fas fa-solid fa-circle-info text-blue-500 cursor-help"></button>
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                       bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
            Lists are (mostly dynamic) sets of suggestions added<br>
            using the PathFinder API. However, PathFinder pre-defines some lists:<br>
            • achievements<br>
            • block<br>
            • item<br>
            • blockitem<br>
            • mods<br>
            • biomes<br>
            • namespaces<br>
            • dimensions<br><br>
            You can define and use your own list names by adding them to the API.
          </span>
        </div>
      <input type="text" placeholder="Custom List Name" value="${arg.custom_list_name}" 
        onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].custom_list_name=this.value; updateJSON()"
        class="customListField rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded mb-2 bg-gray-800 text-white w-full">

      <button onclick="addArgument(${cmdIndex}, data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].args)" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">+ Add Sub-Arg</button>


      <div class="ml-4">
        ${renderArgumentFields(cmdIndex, arg.args, [...parentArgs, argIndex])}
      </div>
    </div>
  `).join("");
}

function makeList(values) {
    return values.trim().split(',');
}

function getPath(parentArgs) {
  return parentArgs.map(i => `[${i}].args`).join("");
}

function renderCommands() {
  const container = document.getElementById("commands");
  container.innerHTML = data.commands.map((cmd, index) => {
      
    const isCollapsed = collapsedCommands.has(index);
    return `
  <div class='relative p-4 rounded-lg bg-gray-800 mt-2'>

    <!-- Löschen -->
    <a class="absolute top-2 right-2 text-white bg-red-700 hover:bg-red-600 px-2 py-1 rounded cursor-pointer"
        onclick="removeCommand(${index})">X</a>

    <!-- Ein-/Ausklappen -->
    <a class="absolute top-2 right-12 text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded cursor-pointer"
        onclick="toggleCommand(${index})">${isCollapsed ? "+" : "-"}</a>

    ${isCollapsed 
      ? `<div class="text-gray-300 mt-8 italic">Command: ${cmd.name || "(unnamed)"}</div>` 
      : `
        <input type="text" placeholder="Command Name" value="${cmd.name}" 
          onchange="data.commands[${index}].name=this.value; updateJSON()"
          class="commandNameField rounded-lg border border-gray-300 px-3 py-2 focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 mt-8 w-full mb-2 bg-gray-800 text-white">

        <textarea placeholder="Description" 
          onchange="data.commands[${index}].description=this.value; updateJSON()" 
          class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 mb-2 w-full bg-gray-800 text-white">${cmd.description}</textarea>

        <button onclick="addArgument(${index}, data.commands[${index}].args)" 
          class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mb-2">+ Add Argument</button>

        <div class="ml-2">
          ${renderArgumentFields(index, cmd.args, [])}
        </div>
      `}
  </div>
`;    
  
  }).join("");

  updateJSON();
}


    function validate() {
        const inputsArgs = document.querySelectorAll('.argNameField');

        inputsArgs.forEach(input => {
          input.addEventListener('input', () => {
              let val = validateText(input.value, "arg");
              if (val != "") {
                  input.classList.add('border-red-500');
                  displayError(input, val)
              } else {
                  input.classList.remove('border-red-500');
                  removeError(input);
              }
          });
        });


        const inputCommands = document.querySelectorAll('.commandNameField');
        inputCommands.forEach(input => {
            input.addEventListener('input', () => {
              let val = validateText(input.value, "command");
              if (val != "") {
                  input.classList.add('border-red-500');
                  if (val.includes("warn")) displayWarning(input, val.replace("-warn", ""));
                  else displayError(input, val)
              } else {
                  input.classList.remove('border-red-500');
                  removeError(input);
              }
            })
        });


        const customListFields = document.querySelectorAll('.customListField');
        customListFields.forEach(input => {
            input.addEventListener('input', () => {
                if (!availableCustomLists.includes(input.value)) {
                    displayWarning(input, "custom-list");
                } else removeError(input);
            })
        });
    }

    function validateText(text, fieldType) {
        if (fieldType == "arg") {
            const regex = /^[a-zA-Z0-9_-]+$/;
            if (text.trim() === '') return "empty";
            if(!regex.test(text)) return "reg";
            else return ""
        } else if (fieldType == "list") {
            const regex = /^\s*([a-zA-Z0-9_-]+\s*)(,\s*[a-zA-Z0-9_-]+\s*)*$/;
            if(!regex.test(text)) return "reg";
            else return "";
        } else if (fieldType == "command") {
            const regex = /^[0-9_-]+$/;
            const regex3 = /^[A-Z]+$/;
            const regex2 = /^[a-z]+$/;
            if (text.trim() === "") return "emptyCMD";
            if (regex3.test(text)) return "uppercase-warn";
            if (regex.test(text)) return "numbers-warn";
            if (!regex2.test(text)) return "regCMD";
            else return "";
        }
    }

    function displayError(input, type) {
        let text = "";
        if (type === "reg") text = ": Argument name contains illegal characters."
        if (type === "regCMD") text = ": Command name contains illegal characters."
        if (type === "empty") text = ": Argument name cannot be empty."
        if (type === "emptyCMD") text = ": Command name cannot be empty."
        if (type === "uppercase") text = ": Command names should not contain any uppercase letters.";
        if (type === "numbers") text = ": Command names should not contain numbers or underscores (_) or dashes (-)";
        if (type === "NSEmpty") text = ": Namepace cannot contain any whitespace characters."

        if (dataMap.get(input) == null) {
            let warn = document.createElement('li');
            warn.classList.add("probErr");
            warn.innerHTML = `<i class="fa-solid fa-bolt"></i> ` + input.value.substr(0, 10) + text;
            document.getElementById("problems").appendChild(warn);
            dataMap.set(input, warn);
        } else {
            let warn = dataMap.get(input);
            warn.classList.remove("probWarn");
            warn.classList.add("probErr");
            warn.innerHTML = `<i class="fa-solid fa-bolt"></i> ` + input.value.substr(0, 10) + text;
        }

        document.getElementById("probHeading").textContent = "Problems (" + dataMap.size + ")";

    }

    function displayWarning(input, type) {
        let text = "";
        if (type === "reg") text = ": Argument contains illegal characters."
        if (type === "regCMD") text = ": Command contains illegal characters."
        if (type === "empty") text = ": Argument cannot be empty."
        if (type === "uppercase") text = ": Command names should not contain any uppercase letters.";
        if (type === "numbers") text = ": Command names should not contain numbers or underscores (_) or dashes (-)";
        if (type === "custom-list") text = ": If using custom lists, you have to hook into the Pathfinder API and create them there."

        if (dataMap.get(input) == null) {
            let warn = document.createElement('li');
            warn.classList.add("probWarn");
            warn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ` + input.value.substr(0, 10) + text;
            document.getElementById("problems").appendChild(warn);
            dataMap.set(input, warn);
        } else {
            let warn = dataMap.get(input);
            warn.classList.add("probWarn");
            warn.classList.remove("probErr");
            warn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ` + input.value.substr(0, 10) + text;
        }

        document.getElementById("probHeading").textContent = "Problems (" + dataMap.size + ")";

    }
    function removeError(input) {
        if (dataMap.get(input) != null) {
            dataMap.get(input).remove();
            dataMap.delete(input);
        }

        document.getElementById("probHeading").textContent = "Problems (" + dataMap.size + ")";
    }


renderCommands();
displayError(document.getElementById('nameSpaceEnter'), "NSEmpty");


function copyJSON() {
  const json = document.getElementById('jsonOutput').innerText;
  const button = document.getElementById('copybutton');

  navigator.clipboard.writeText(json)
    .then(() => {
      button.innerText = '✔ Copied!';

      setTimeout(() => {
        button.innerText = '📝 Copy';
      }, 4000);
    })
    .catch(err => console.error('Failed to copy:', err));
}

// Toggle mobile menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
mobileMenu.classList.toggle('hidden');
});