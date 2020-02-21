/*jshint esversion: 6 */

class State {
  //TODO
  constructor() {

  }
}

class TicTacToeState extends State { //TODO: or better interface?
  constructor() {
    super();
    this.field = [
      [1, -1, 0],
      [0, 1, 0],
      [0, 0, -1]
    ];
    this.divs = [];
    this.info = "";
  }

  value() {
    //lines -
    for (let j = 0; j < 3; j++) {
      for (let i = 1; i < 3; i++) {
        if (this.field[0][j] && this.field[0][j] == this.field[i][j]) {
          if (i == 2) return this.field[0][j];
          else continue;
        } else break;
      }
    }
    //columns |
    for (let i = 0; i < 3; i++) {
      for (let j = 1; j < 3; j++) {
        if (this.field[i][0] && this.field[i][0] == this.field[i][j]) {
          if (j == 2) return this.field[i][0];
          else continue;
        } else break;
      }
    }
    //diag \
    for (let i = 1; i < 3; i++) {
      if (this.field[0][0] && this.field[0][0] == this.field[i][i]) {
        if (i == 2) return this.field[0][0];
        else continue;
      } else break;
    }

    //diag /
    for (let i = 1; i < 3; i++) {
      if (this.field[2][0] != 0 && this.field[2][0] == this.field[2 - i][i]) {
        if (i == 2) return this.field[2][0];
        else continue;
      } else break;
    }

    //all is filled
    let filled = true;
    for (let i = 0; i < 3 && filled; i++) {
      for (let j = 0; j < 3 && filled; j++) {
        if (!this.field[i][j]) filled = false;
      }
    }
    if (filled) return 0;
    return NaN;
  }

  gameactive() {
    return isNaN(this.value());
  };


  computermove() {
    if (this.gameactive() && ((document.getElementById("xiscomputer").checked && curplayer == 1) || (document.getElementById("oiscomputer").checked && curplayer == -1))) {
      //TODO timeout
      let best = (curplayer == 1) ? -Infinity : Infinity;
      let minimaxfun = (curplayer == 1) ? Math.max : Math.min;
      for (let k in minimax(this).children) {
        best = minimaxfun(best, minimax(this).children[k].value);
      }

      const options = (minimax(this).children).filter((x) => (x.value == best));
      const idx = Math.floor(Math.random() * options.length);
      this.field = options[idx].state.field;
      curplayer *= -1;
    }
  };


  creatediv(interactive) {
    //for (let i = 0; i < 3; i++) {
    //for (let j = 0; j < 3; j++) {
    let div = document.createElement("div");
    div.className = "field";
    div.style.width = "100%"; //": + "vh";
    div.fieldinfo = document.createElement("div");
    this.divs.push(div);
    let box = [];
    div.box = box;



    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let id = i * 3 + j;
        box[id] = document.createElement("div");
        box[id].style.width = 30 + "%";
        box[id].style.margin = 1 + "%";

        box[id].text = document.createElement("div");
        box[id].appendChild(box[id].text);
        div.appendChild(box[id]);
        box[id].i = i;
        box[id].j = j;
        box[id].state = this;
        if (interactive) box[id].onclick = function(e) {
          if (this.state.gameactive() && !this.state.field[this.i][this.j]) {
            this.state.field[this.i][this.j] = curplayer;
            delete this.state.minimax;
            curplayer *= -1;
          } else if (!this.state.gameactive()) {
            curplayer = 1;
            //reset
            delete this.state.minimax;
            this.state.field = [
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0]
            ];
          }
          this.state.computermove();
          delete this.state.minimax;
          this.state.updatedivs();
          updatetree();
        };
      }
    }
    return div;
  };


  updatedivs() {
    if (this.gameactive()) {
      this.info = `${(curplayer == 1 ? "X" : "O")}, ${minimax(this).value}`;
    } else {
      this.info = this.value() ? `${(this.value() == 1 ? "X" : "O")} has won` : "draw";
    }
    let f = this.field;
    for (let divid in this.divs) {
      let box = this.divs[divid].box;
      let k = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const id = i * 3 + j;
          const bval = (this.gameactive() && !f[i][j]) ? minimax(this).children[k++].value : 0;
          box[id].text.innerHTML = f[i][j] ? (f[i][j] == 1 ? "X" : "O") : (this.gameactive() ? bval : "");
          if (f[i][j]) {
            box[id].style.backgroundColor = (f[i][j] == 1) ? "red" : "blue";
          } else if (this.gameactive()) {
            box[id].style.backgroundColor = (bval > 0) ? "#FFAAAA" : (bval < 0) ? "#AAAAFF" : "#CCCCCC";
          } else {
            box[id].style.backgroundColor = "#CCCCCC";
          }
        }
      }
      this.divs[divid].fieldinfo.innerHTML = this.info;
    }
  };
};




var curplayer = 1; //TODO: refactor this to State
let minimax = function(f0) {
  function recursion(f, player) {
    if (f.minimax) return f.minimax; //we already have a result

    let cval = f.value();
    if (!isNaN(cval)) {
      f.minimax = {
        value: cval,
        state: f,
        children: []
      };
      return f.minimax;
    }

    let best = (player == 1) ? -Infinity : Infinity;
    let minimaxfun = (player == 1) ? Math.max : Math.min;
    let children = []; //TODO add children to gameInstance class
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!f.field[i][j]) {
          g = new TicTacToeState; //TODO make this generic
          function clonefield(f) {
            return f.map(k => k.map(x => x));
          }
          g.field = clonefield(f.field);
          g.field[i][j] = player;
          let r = recursion(g, -1 * player);
          children.push(r);
          //if(f==f0) info[i][j] = `${r.value}`;
          best = minimaxfun(best, r.value);
        }
      }
    }
    f.minimax = {
      value: best,
      state: f,
      children: children
    };
    return f.minimax;
  }
  return recursion(f0, curplayer);
};

let alphabeta = function(f) {
  function recursion(f, player, alpha, beta) {
    let cval = value(f);
    if (!isNaN(cval)) return cval;

    let best = (player == 1) ? -Infinity : Infinity;
    let minimaxfun = (player == 1) ? Math.max : Math.min;
    for (let i = 0; i < 3 && alpha < beta; i++) {
      for (let j = 0; j < 3 && alpha < beta; j++) {
        if (!f[i][j]) {
          g = clonefield(f);
          g[i][j] = player;
          let val = recursion(g, -1 * player);
          best = minimaxfun(best, val);
          if (player == 1) {
            alpha = Math.max(alpha, best);
          }
          if (player == -1) {
            beta = Math.min(beta, best);
          }
          //info[i][j] = `${val} mit [alpha, beta] = [${alpha}, ${beta}]`;
        }
      }
    }
    return best;
  }
  return recursion(f, curplayer, -Infinity, Infinity);
};


var updatetree = function() {
  treeData = minimax(userstate);
  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, function(d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level
  root.children.forEach(collapse);

  update(root);
};


// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 180
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
    .attr('class', 'node')
    .attr('r', 1e-6)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

  // Add labels for the nodes
  nodeEnter.append('text')
    .attr("dy", ".35em")
    .attr("x", function(d) {
      return d.children || d._children ? -13 : 13;
    })
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function(d) {

      //createboard(d.data.field);
      if (!d.data.state.box);
      d.data.state.creatediv(false);
      d.data.state.updatedivs();
      return d.data.state.info;
    });

  fo = nodeEnter.append('foreignObject').attr('width', '60px').attr('height', '60px');



  let div = fo.append('xhtml:div'); //.html('Das ist HTML!');
  div.append("div").append(function(d) {
    d.data.state.div
    let div = d.data.state.creatediv(false);
    d.data.state.updatedivs();
    return div;
  });


  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
    .data(links, function(d) {
      return d.id;
    });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal(o, o);
    });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
    .duration(duration)
    .attr('d', function(d) {
      return diagonal(d, d.parent);
    });

  // Remove any exiting links
  var linkExit = link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal(o, o);
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}

var inittree = function() {
  // Set the dimensions and margins of the diagram
  var margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30
    },
    //width = 960 - margin.left - margin.right,
    //height = 500 - margin.top - margin.bottom;
    width = 700;
  height = 500;

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  //var svg = d3.select("body").append("svg")
  svg = d3.select("#tree")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" +
      margin.left + "," + margin.top + ")");

  i = 0, duration = 750;
  treeData = minimax(userstate);
  root = d3.hierarchy(treeData, function(d) {
    return d.children;
  });

  // declares a tree layout and assigns the size
  treemap = d3.tree().size([height - 20, width - 20]);

  updatetree();
};

var userstate;
window.onload = function(e) {
  userstate = new TicTacToeState;
  div0 = userstate.creatediv(true);
  document.getElementById("game").appendChild(div0.fieldinfo);
  document.getElementById("game").appendChild(div0);

  userstate.updatedivs();
  inittree(userstate);
};
