let data = { commands: [] };
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
    }

    function removeCommand(index) {
      data.commands.splice(index, 1);
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
        <div class='border p-2 rounded-lg bg-gray-50 mt-2'>
          <input type="text pattern="[a-zA-Z0-9_-]+" required placeholder="Argumentname" value="${arg.name}" 
            onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].name=this.value; updateJSON()"
            class="argNameField border px-2 py-1 rounded w-full mb-2">

          <textarea placeholder="Beschreibung" onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].description=this.value; updateJSON()" class="border px-2 py-1 rounded w-full mb-2">${arg.description}</textarea>

          <label>Argument Type:</label>
          <select onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].type=this.value; updateJSON()" class="border px-2 py-1 rounded w-full mb-2">
            <option ${arg.type==="string"?"selected":""}>Text</option>
            <option ${arg.type==="integer"?"selected":""}>Zahl</option>
            <option ${arg.type==="decimal"?"selected":""}>Dezimalzahl</option>
            <option ${arg.type==="list"?"selected":""}>Liste</option>
            <option ${arg.type==="entity"?"selected":""}>Entitäten</option>
            <option ${arg.type==="coordinate"?"selected":""}>Koordinate</option>
          </select>

          <label>Vordefinierte Vorschläge:</label>
          <input type="text" placeholder="foo, bar" value="${arg.suggestions}" 
            onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].suggestions= makeList(this.value); updateJSON()"
            class="border px-2 py-1 rounded w-full mb-2">



          <label>Vorschlagstyp:</label>
          <p class="text-xs text-gray-400">This defines how suggestions are being displayed.<br>
          Using "list" needs a custom list name, which has to be linked to the Pathfinder API.<br>All suggestion types in this field are predefined. If you just want e.g. integers, select "(none)."</p>
          <select onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].suggestion_type=this.value; updateJSON()" class="border px-2 py-1 rounded w-full mb-2">
            <option value="">(keine)</option>
            <option ${arg.suggestion_type==="list"?"selected":""}>Liste</option>
            <option ${arg.suggestion_type==="players"?"selected":""}>Spieler</option>
            <option ${arg.suggestion_type==="entities"?"selected":""}>Entitäten</option>
            <option ${arg.suggestion_type==="coordinates"?"selected":""}>Koordinaten</option>
          </select>


          <input type="text" placeholder="Benutzerdefinierte Liste" value="${arg.custom_list_name}" 
            onchange="data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].custom_list_name=this.value; updateJSON()"
            class="border px-2 py-1 rounded w-full mb-2">

          <button onclick="addArgument(${cmdIndex}, data.commands[${cmdIndex}].args${getPath(parentArgs)}[${argIndex}].args)" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">+ Sub-Argument</button>
          <button onclick="removeArgument(${cmdIndex}, data.commands[${cmdIndex}].args${getPath(parentArgs)}, ${argIndex})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Argument löschen</button>

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
      container.innerHTML = data.commands.map((cmd, index) => `
        <div class='relative border p-4 rounded-lg bg-gray-50'>
            <a class="absolute top-2 right-2 text-white bg-red-700 hover:bg-red-600 px-2 py-1 rounded cursor-pointer"
                onclick="removeCommand(${index})">X</a>

            <a class="absolute top-2 right-9 text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded cursor-pointer"
                onclick="hideCommand(${index})">-</a>

          <input type="text" placeholder="Befehlsname" value="${cmd.name}" 
            onchange="data.commands[${index}].name=this.value; updateJSON()"
            class="commandNameField mt-8 border px-2 py-1 rounded w-full mb-2">

          <textarea placeholder="Beschreibung" onchange="data.commands[${index}].description=this.value; updateJSON()" class="border px-2 py-1 rounded w-full mb-2">${cmd.description}</textarea>

          <button onclick="addArgument(${index}, data.commands[${index}].args)" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mb-2">+ Argument hinzufügen</button>

          <div class="ml-2">
            ${renderArgumentFields(index, cmd.args, [])}
          </div>
        </div>
      `).join("");
        
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
                if (regex3.test(text)) return "uppercase-warn";
                if (regex.test(text)) return "numbers-warn";
                if (!regex2.test(text)) return "regCMD-warn";
                else return "";
            }
        }

        function displayError(input, type) {
            let text = "";
            if (type === "reg") text = ": Argument enthält nicht erlaubte Zeichen."
            if (type === "regCMD") text = ": Befehl enthält nicht erlaubte Zeichen."
            if (type === "empty") text = ": Argument kann nicht leer sein."
            if (type === "uppercase") text = ": Befehlsnamen sollten keine Großbuchstaben enthalten.";
            if (type === "numbers") text = ": Befehlsnamen sollten keine Nummern, Unter- (_) oder Bindestriche (-) enthalten.";
            
            if (dataMap.get(input) == null) {
                let warn = document.createElement('li');
                warn.classList.add("probErr");
                warn.textContent = input.value.substr(0, 10) + text;
                document.getElementById("problems").appendChild(warn);
                dataMap.set(input, warn);
            } else {
                let warn = dataMap.get(input);
                warn.textContent = input.value.substr(0, 10) + text;
            }
            
            document.getElementById("probHeading").textContent = "Probleme (" + dataMap.size + ")";
            
        }

        function displayWarning(input, type) {
            let text = "";
            if (type === "reg") text = ": Argument enthält nicht erlaubte Zeichen."
            if (type === "regCMD") text = ": Befehl enthält nicht erlaubte Zeichen."
            if (type === "empty") text = ": Argument kann nicht leer sein."
            if (type === "uppercase") text = ": Befehlsnamen sollten keine Großbuchstaben enthalten.";
            if (type === "numbers") text = ": Befehlsnamen sollten keine Nummern, Unter- (_) oder Bindestriche (-) enthalten.";
            
            if (dataMap.get(input) == null) {
                let warn = document.createElement('li');
                warn.classList.add("probWarn");
                warn.textContent = input.value.substr(0, 10) + text;
                document.getElementById("problems").appendChild(warn);
                dataMap.set(input, warn);
            } else {
                let warn = dataMap.get(input);
                warn.textContent = input.value.substr(0, 10) + text;
            }
            
            document.getElementById("probHeading").textContent = "Probleme (" + dataMap.size + ")";
            
        }
        function removeError(input) {
            if (dataMap.get(input) != null) {
                dataMap.get(input).remove();
                dataMap.delete(input);
            }
            
            document.getElementById("probHeading").textContent = "Probleme (" + dataMap.size + ")";
        }
 

    renderCommands();


function copyJSON() {
  const json = document.getElementById('jsonOutput').innerText;
  const button = document.getElementById('copybutton');

  navigator.clipboard.writeText(json)
    .then(() => {
      button.innerText = '✔ Kopiert!';

      setTimeout(() => {
        button.innerText = '📝 Kopieren';
      }, 4000);
    })
    .catch(err => console.error('Failed to copy:', err));
}
