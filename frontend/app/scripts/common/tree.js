/*
    convert tree to flatten array
    visitor(treeData)
 */
var visitor = function(graph) {
    var i, l,
        nodes=[],
        visited=[];

    var clone = function(n) {
        // improve the function yourself I'm lazy
        var i,l,
            props=["id","parent_id","depth","index","text"],
            result={};
        for (i = 0, l = props.length; i < l; i++) {
            result[props[i]]= n[props[i]];
        }
        return result;
    };

    var helper = function(node, parent_id, depth, permalink) {
        var i, limit;
        if (visited.indexOf(node.id) == -1) {
            visited.push(node.id);
            if(!permalink) permalink = [];
            permalink.push(node.name);
            node.permalink = permalink.join('/').toLowerCase();
            permalink.pop();
            node.parent_id = parent_id;
            node.depth = depth;
            //nodes.push(clone(node));
            nodes.push(node);
            //console.log(node);
            if( node.children) {
                for (i = 0, limit = node.children.length; i < limit; i++) {
                    permalink.push(node.name);
                    helper(node.children[i], node.id, depth + 1, permalink);
                    permalink.pop();
                }
            }
        }
    };

    //console.log('graph.length:'+ graph.length);
    for (i = 0, l = graph.length; i < l; i++) {
        var parent_id = graph[i].parent_id || null;
        var depth = 0;
        helper(graph[i], parent_id, depth);
    }

    return nodes;
};

/*
    convert flatten array to tree
    makeTree{ q: arrayData [,id: 'id', parent_id: 'parent_id, children: 'children]});
 */
var makeTree = function(options) {
    var children, e, id, o, pid, temp, _i, _len, _ref;
    id = options.id || "id";
    pid = options.parent_id || "parent_id";
    children = options.children || "children";
    temp = {};
    o = [];
    _ref = options.q;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e[children] = [];
        temp[e[id]] = e;
        if (temp[e[pid]] != null) {
            temp[e[pid]][children].push(e);
        } else {
            o.push(e);
        }
    }
    return o;
};
