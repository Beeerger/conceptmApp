/**
 * vis_network.js is the required libary (written by us) to create, modify and delete vis_network graphs.
 * it includes two constructors (one for an emptythis.network, one for athis.network with some example nodes and edges)
 * and many functions used for creating, editing and deleting nodes and edges.
 * 
 * TO USE:
 *  -add a new div inside the html with id="network_editor_container"
 *  -import this js script
 *  -call one constructor to initate thethis.network
 * 
 * There is also added functionality for import/export to localStorage and import/export by the qrcodeScanner
 * 
 * @author André Berger 
 * @author Cornelius Brütt
 * @version 1.2
 */
DEBUG = true; //specify if debug console output should be generated

class ConceptMap {
  CONTAINER_ID = "network_editor_container"; //the id the div container should have
  NODE_DROPDOWN_ID = "node-labels";          //the ids the list-container (example: dropdownmenu) for
  EDGE_DROPDOWN_ID = "edge-labels";          // both nodes and edges should have
  
  /**
   * generates a new ConceptMap and connects it to the <div> with the CONTAINER_ID 
   * @param {array} options vis_network options array
   * @param {boolean} isExample should be the map filled with some example nodes
   */
  constructor(options, isExample) {
    this.selectedEdge = 0;
    this.selectedNode = 0;
    //get the container in which the network should be placed
    this.container = document.getElementById(this.CONTAINER_ID);

    // generate the data inside the network, contains nodes and edges
    if (isExample) {
      // create an array with example nodes
      var nodes = new vis.DataSet([
        { id: 1, label: "saure Lösung", x: -354, y: 1 },
        { id: 2, label: "Oxonium-Ionen", x: -215, y: 147 },
        { id: 3, label: "Säure", x: -159, y: 55 },
        { id: 4, label: "Protonendonator", x: -187, y: -37 },
        { id: 5, label: "Säure-Base-Paar", x: -8, y: 144 },
        { id: 6, label: "Säure-Base-Reaktion", x: 14, y: -40 },
        { id: 7, label: "Base", x: 153, y: 64 },
        { id: 8, label: "Protonenakzeptor", x: 215, y: -65 },
        { id: 9, label: "basische Lösung", x: 390, y: -13 },
        { id: 10, label: "Hydroxid-Ionen", x: 256, y: 152 },
      ]);
      //set the counter
      this.nextNodeID = 11;

      // create an array with example edges
      var edges = new vis.DataSet([
        { id: -1, from: 1, to: 2, label: "enthält" },      // , arrows:'to,from' possible individually
        { id: -2, from: 3, to: 1, label: "bildet mit Wasser" },
        { id: -3, from: 3, to: 4, label: "ist definiert als" },
        { id: -4, from: 3, to: 5, label: "ist Teil eines" },
        { id: -5, from: 5, to: 6, label: "ist Teil der" },
        { id: -6, from: 7, to: 5, label: "ist Teil eines" },
        { id: -7, from: 7, to: 8, label: "ist definiert als" },
        { id: -8, from: 7, to: 9, label: "bildet mit Wasser" },
        { id: -9, from: 9, to: 10, label: "enthält" },
      ]);
      //set the counter
      this.nextEdgeID = -10;
      //save the created arrays to thethis.data
      this.data = {
        nodes: nodes,
        edges: edges,
      };

    }
    else {
      //if no example, the data should be empty
      this.data = {
        nodes: new vis.DataSet([]),
        edges: new vis.DataSet([])
      };
      //set the counters
      this.nextNodeID = 1;
      this.nextEdgeID = -1;
    }

    //last, the options. If example or if no options are given, generate some default options. 
    //If not, take the parameter options
    if (isExample || !options) {
      this.options = this.generateDefaultOptions()
    } else{
      this.options = options;
    }

    // build the network together
    this.network = new vis.Network(this.container, this.data, this.options);

    // last, add the event listeners
    this.addAllEventListeners()

    if (DEBUG){
      console.log("[NETWORK] network succesfully build")
    }
  }

  /**
   * generates default options for a network (without assigning it)
   * @returns options array
   */
  generateDefaultOptions() {
    let options = {
      manipulation: {
        enabled: false,        // hide the edit button
        //we set prompts as the default input method
        addNode: function (nodeData, callback) {
          nodeData.label = prompt("Please enter node name", "");
          callback(nodeData);
        },
        editNode: function (nodeData, callback) {
          nodeData.label = prompt("Please enter node name", "");
          callback(nodeData);
        },
        addEdge: function (edgeData, callback) {
          if (edgeData.from === edgeData.to) {
            var r = confirm("Do you want to connect the node to itself?");
            if (r === true) {
              edgeData.label = prompt("Please enter edge name", "");
              callback(edgeData);
            }
          }
          else {
            edgeData.label = prompt("Please enter edge name", "");
            callback(edgeData);
          }
        },
        editEdge: function (nodeData, callback) {
          nodeData.label = prompt("Please enter edge name", "");
          callback(nodeData);
        },
      },
      layout: {
        hierarchical: false,  // this makes two edges on same way visible, but lessens visibility
      },
      edges: {                // options set for all edges
        arrows: 'to',         // arrows on the "to" end of the edge
        physics: false,
        smooth: true,
      },
      nodes: {
        shape: "box",
        fixed: false,
        physics: false,
      }
    };
    return options;
  }

  /**
   * adds the EventListeners on the network required for correct functionality
   */
  addAllEventListeners() {
    let conceptMap = this; //reference this object, so the anonymous func can access its parameters
    this.network.on("click", function (params) {
      if (DEBUG) {
        console.log("[NETWORK] Selected NodeID: " + this.getNodeAt(params.pointer.DOM) + "\n"
          + "[NETWORK] Selected EdgeID: " + this.getEdgeAt(params.pointer.DOM));
        }
        conceptMap.selectedNode = this.getNodeAt(params.pointer.DOM);
        conceptMap.selectedEdge = this.getEdgeAt(params.pointer.DOM);
      
    })

    //we define double click as an prompt to add a edge
    //let conceptMap = this;
    this.network.on("doubleClick", function (params) {
      if (DEBUG) {
        console.log("[NETWORK] Dbclick on NodeID: " + this.getNodeAt(params.pointer.DOM) + "\n" 
          + "[NETWORK] Dbclick on EdgeID: " + this.getEdgeAt(params.pointer.DOM));
        }
        if (conceptMap.selectedNode) {console.log("edit this node"); this.editNode(); } //if a node is selected, fire editMode
        if (conceptMap.selectedEdge) {this.editEdgeMode(); }
    })
    if (DEBUG) {
      console.log("[NETWORK] [EVT] event listeners added")
    }
  }


  /**
   * deletes the current selected node or edge or both
   */
  deleteSelectedObj() {
    if(DEBUG){
      console.log("[NETWORK] trying to delete the selected (edgeId, nodeID): ",this.selectedEdge,this.selectedNode);
    } 
    if (this.selectedNode) { //check if selected Object is undefined. If not, remove
      this.deleteNodeById(this.selectedNode);
    }
    if (this.selectedEdge) {
      this.deleteEdgeById(this.selectedEdge);
    }
  }

  /**
   * adds a node to the network with a name/label
   * @param {name} String - The name for the node
   */
  addNodeByName(name) {
    this.data.nodes.add({ id:this.nextNodeID, label: name });
    this.nextNodeID++;
    if (DEBUG){
      console.log("[NETWORK] added node: ",name);
    }
  }

  /**
   * adds a node using the selection menu, (useful for the student editor)
   */
  addNodeBySelection(){
    var elem = document.getElementById(this.NODE_DROPDOWN_ID)
    var name = elem.value.name;
    this.addNodeByName(name);
  }

  /**
   * deletes a node from the network using its name/label
   * if more than one nodes exist, delete the first found node
   * @param {name} String - The name of the node
   * @param {nodeID} int - ID of the node to be deleted
   */
  deleteNodeByName(name) {
    // find the node based on the name
    var possibleNodes =this.data.nodes.get({
      filter: function (item) {
        return (item.label == name);
      }
    })
    // remove the (first) found node from the DataSet
    this.data.nodes.remove(possibleNodes[0])
    if (DEBUG){
      console.log("[NETWORK] removed node: ",name);
    }
  }

  /**
   * adds an edge with a label to the network
   * @param {name} String - The name for the edge
   * @param {connection} Array tuple with [fromNode, toNode]
   */
  addEdgeByName(name, connection) {
    let [fromNode, toNode] = connection;
    // find id of the starting node
    var fromNodeData =this.data.nodes.get({
      filter: function (item) {
        return (item.label == fromNode)
      }
    })
    // find the id of the target node
    var toNodeData =this.data.nodes.get({
      filter: function (item) {
        return (item.label == toNode)
      }
    })

    // add the egde to the DataSet and decrease idCounter
    this.data.edges.add({ id:this.nextEdgeID, from: fromNodeData[0].id, to: toNodeData[0].id, label: name })
    this.nextEdgeID--

    if (DEBUG){
      console.log("[NETWORK] added edge: " + name + " from: " + fromNode + " to:" + toNode );
    }
  }

  /**
   * adds a new Edge using the given selection menu
   * (useful for the student editor)
   */
  addEdgeBySelection(){
    var elem = document.getElementById(this.EDGE_DROPDOWN_ID)
    var name = elem.value.name
    this.addEdgeByName(name);
  }


  /**
   * deletes an edge by its label from the network
   * If more than one edge with this name exits, only delete the first found
   * @param {name} String - The name of the edge
   * @param {edgeID} int - ID of the edge to be deleted
   */
  deleteEdgeByName(name, fromNode, toNode) {

    // find the nodes from the given names
    var fromNodeData =this.data.nodes.get({
      filter: function (item) {
        return (item.label == fromNode)
      }
    })
    var toNodeData =this.data.nodes.get({
      filter: function (item) {
        return (item.label == toNode)
      }
    })

    // find the edge with the node ids and the given name
    var edgeData =this.data.edges.get({
      filter: function (item) {
        return (item.label == name && item.from == fromNodeData[0].id && item.to == toNodeData[0].id)
      }
    })

    // remove the edge from the DataSet
   this.data.edges.remove(edgeData[0])

   if (DEBUG){
    console.log("[NETWORK] deleted edge: " + name + " from: " + fromNode + " to:" + toNode );
  }
  }

  /**
   * deletes an edge from the network, referenced by its internal ID
   * @param {edgeID} int - ID of the edge to be deleted
   */
  deleteEdgeById(edgeID) {
   this.data.edges.remove(edgeID);
   if (DEBUG){
    console.log("[NETWORK] deleted edge: " + edgeID + " from: " + fromNode + " to:" + toNode );
   }
  }

  
  /**
   * deletes a node from the network
   * @param {name} String - The name of the node
   * @param {nodeID} int - ID of the node to be deleted
   */
  deleteNodeById(nodeID) {
    this.data.nodes.remove(nodeID);
   
    if (DEBUG){
      console.log("[NETWORK] deleted node: " + nodeID);
     }
  }


  /**
   * loads a json file from local storage to create a new network for the correct user
   * @param user string of the user to identify
   */
  loadMap(user) {
    // load the JSON file from the storage
    var storePosition = user + "JsonFile"
    var jsonFileObject = localStorage.getItem(storePosition)
    var jsonFile = JSON.parse(jsonFileObject)
    if (DEBUG) {
      console.log("[NETWORK] loading: ", jsonFile, "from: ", storePosition)
    }
    // set the data to the contents of the json file
    this.setData(jsonFile)
  }

  /**
   * saves the current network to localStorage
   * @param {string} user username to definde save-position
   */
  saveMap(user) {
    // create a json file withthis.network contents
    var jsonFile = this.createDataAsJson(network)
    var storePosition = user + "JsonFile"
    // store the JSON file in the localStorage
    localStorage.setItem(storePosition, JSON.stringify(jsonFile));
    if (DEBUG) {
      console.log("[NETWORK] saving: ", jsonFile, "at: ", storePosition);
    }
  }

  /**
   * asks the QRScanner to scan a QR-Code for us, to import a map for creating a new network
  */
  importMapFromQr() {
    // import from QR code
    // using a callback function to stop flow
    QRScanner.importDataFromQR(this.#importMapHelper)
  }

  /**
   * asks the QRScanner to scan a QR-Code for us, to import a map that can be used to work on tasks 
   */
  importTask() {
    // import from QR code
    // using a callback function to stop flow
    QRScanner.importDataFromQR(this.#importTaskHelper)
  }
  /**
   * helper function for importMAP function to stop programm flow
   * If a jsonFile-String with the correct format gets provided, this can be used to
   * set the data of the network directly (without qrscanner)
   * @param {jsonFileString} String  json file to be used as data 
  */
  #importMapHelper(jsonFileString) {
    var jsonFile = JSON.parse(jsonFileString)
    // set the network data to the contents of the json file
    this.setData(jsonFile);
    if (DEBUG){
      console.log("[NETWORK] imported: ", jsonFile)
    }
  }

/**
 * helper function for importTask function to stop programm flow
 * If a jsonFile-String with the correct format gets provided, this can be used to
 * set the data of the network directly (without qrscanner)
 * @param {jsonFileString} String  json file to be used as data 
 */
  #importTaskHelper(jsonFileString) {
    SaveTask(jsonFileString);
    PopulateLabels();
  }
   /**
   * skip the qrCodeScanner and only populate the task with the saved example
   * @deprecated
   */
   importTaskExample() {
    PopulateLabels();
  }

  /**
   * exports the current network to a json file and asks
   * the QRScanner to generate a QR-Code for us
  */
  exportMapToQr() {
    // create a json file withthis.network contents
    var jsonFile = this.createDataAsJson(this.network)

    var jsonString = JSON.stringify(jsonFile)
    // create thethis.data as an QR code
    QRScanner.sendDataToQR(jsonString)
    if(DEBUG){
     console.log("[NETWORK] exporting to QR: ", jsonFile)
    }
  }

  /**
   * creates the network data as jsonFile
   * @return the json file containing networkthis.data 
   */
  createDataAsJson() {
    // store the current positions in the nodes
   this.network.storePositions()
    // copy the data from the visthis.network DataSet
    var nodesCopy =this.data.nodes.get()
    var edgesCopy =this.data.edges.get()

    // store the data in a JSON file
    var jsonFile = {
      "nodes": [nodesCopy],
      "edges": [edgesCopy],
      "nextNodeID":this.nextNodeID,
      "nextEdgeID":this.nextEdgeID,
    }
    //no debug output here as this resulted in humoungus amounts of console spam
    return jsonFile
  }

  /**
   * sets the current network.data to the contents of the jsonFile
   * @param {jsonFile} jsonFile 
   */
  setData(jsonFile) {
    // clear the currentthis.data
   this.data.nodes.clear()
   this.data.edges.clear()

    // set thethis.data from the provided JSON file
   this.data.nodes.add(jsonFile.nodes[0])
   this.data.edges.add(jsonFile.edges[0])
    // set the IDs to the new IDs
   this.nextNodeID = jsonFile.nextNodeID
   this.nextEdgeID = jsonFile.nextEdgeID
  }

 

  /**
   * function to fill the labels for the dropdowns for student editor
   */
  populateLabels() {
    var [nodeNames, edgeNames] = ExtractLabels()
    console.log(nodeNames)
    var nodeSelect = document.getElementById(this.NODE_DROPDOWN_ID)
    var edgeSelect = document.getElementById(this.EDGE_DROPDOWN_ID)

    nodeSelect.innerHTML = "";
    edgeSelect.innerHTML = "";

    // iterating over nodes and adding them to the dropdown menu
    for (var i = 0; i < nodeNames.length; i++) {
      var opt = nodeNames[i]
      //console.log(opt)
      var el = document.createElement("option")
      el.text = opt
      el.value = opt
      nodeSelect.add(el)
    }

    // iterating over edges and adding them to the dropdown menu
    for (var i = 0; i < edgeNames.length; i++) {
      var opt = edgeNames[i]

      var el = document.createElement("option")
      el.text = opt
      el.value = opt
      edgeSelect.add(el)
    }

  }

  /**
   * Use the loaded teacher map to find out all possible node labels
   * @returns an array with all node labels from saved teacher map in localStorage
   */
  extractLabels() {

    var jsonFileObject = localStorage.getItem("taskjsonFile")
    var jsonFile = JSON.parse(jsonFileObject)
    var nodeNames = []
    var labelNames = []
    for (let i = 0; i < jsonFile.nodes[0].length; i++) {
      nodeNames.push(jsonFile.nodes[0][i].label)
    }
    for (let i = 0; i < jsonFile.edges[0].length; i++) {
      labelNames.push(jsonFile.edges[0][i].label)
    }
    console.log("Extracted: ", "Nodes: ", nodeNames, "Edges: ", labelNames)
    return [nodeNames, labelNames]
  }

  /**
   * helper function to complete import of task map from teacher for the student
   * @param {String} jsonFileString containing the visthis.network mapthis.data
   */
  saveTask(jsonFileString) {
    var jsonFile = JSON.parse(jsonFileString)
    localStorage.setItem("taskjsonFile", JSON.stringify(jsonFile));
    console.log("imported and saved map to taskjsonFile")
  }

  /**
   * creates a new blank node using the network intern naming function 
   * (default: prompt)
   */
  createBlankNode() {
    var updatedIds =this.data.nodes.add([{
      label: 'new',
      //changed so that the node starts in the middle
      x: 0,//x:params.pointer.canvas.x,
      y: 0//y:params.pointer.canvas.y
    }]);
   this.network.selectNodes([updatedIds[0]]);
   this.network.editNode();
  }

  /**
   * creates a new blank edge using the network intern naming function 
   * (default: prompt)
   */
  createBlankEdge() {
   this.network.addEdgeMode();
  }

/**
 * log some information in the console. Only generates output if DEBUG mode is activated
 */
  showInfo() {
    if (DEBUG) {
      console.log("Next Node ID: ",this.nextNodeID)
      console.log("Next Edge ID: ",this.nextEdgeID)
      // console.log(data.nodes)
      // console.log(data.edges)
    }
    else {
      console.log("[INFO] Debug mode not activated");
    }
  }
}