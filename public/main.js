
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = F2(
	function (decoder, wrapped) {
		return A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			wrapped,
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				var _p3 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					_elm_lang$core$Json_Decode$keyValuePairs(_elm_lang$core$Json_Decode$value),
					input);
				if (_p3.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(fallback);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p3._0);
				}
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _debois$elm_mdl$Material_Helpers$noAttr = A2(_elm_lang$html$Html_Attributes$attribute, 'data-elm-mdl-noop', '');
var _debois$elm_mdl$Material_Helpers$aria = F2(
	function (name, value) {
		return value ? A2(
			_elm_lang$html$Html_Attributes$attribute,
			A2(_elm_lang$core$Basics_ops['++'], 'aria-', name),
			'true') : _debois$elm_mdl$Material_Helpers$noAttr;
	});
var _debois$elm_mdl$Material_Helpers$delay = F2(
	function (t, x) {
		return A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(x),
			_elm_lang$core$Process$sleep(t));
	});
var _debois$elm_mdl$Material_Helpers$cssTransitionStep = function (x) {
	return A2(_debois$elm_mdl$Material_Helpers$delay, 50, x);
};
var _debois$elm_mdl$Material_Helpers$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _debois$elm_mdl$Material_Helpers$lift = F6(
	function (get, set, fwd, update, action, model) {
		var _p0 = A2(
			update,
			action,
			get(model));
		var submodel_ = _p0._0;
		var e = _p0._1;
		return {
			ctor: '_Tuple2',
			_0: A2(set, model, submodel_),
			_1: A2(_elm_lang$core$Platform_Cmd$map, fwd, e)
		};
	});
var _debois$elm_mdl$Material_Helpers$lift_ = F5(
	function (get, set, update, action, model) {
		return {
			ctor: '_Tuple2',
			_0: A2(
				set,
				model,
				A2(
					update,
					action,
					get(model))),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _debois$elm_mdl$Material_Helpers$map2nd = F2(
	function (f, _p1) {
		var _p2 = _p1;
		return {
			ctor: '_Tuple2',
			_0: _p2._0,
			_1: f(_p2._1)
		};
	});
var _debois$elm_mdl$Material_Helpers$map1st = F2(
	function (f, _p3) {
		var _p4 = _p3;
		return {
			ctor: '_Tuple2',
			_0: f(_p4._0),
			_1: _p4._1
		};
	});
var _debois$elm_mdl$Material_Helpers$blurOn = function (evt) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', evt),
		'this.blur()');
};
var _debois$elm_mdl$Material_Helpers$effect = F2(
	function (e, x) {
		return {ctor: '_Tuple2', _0: x, _1: e};
	});
var _debois$elm_mdl$Material_Helpers$pure = _debois$elm_mdl$Material_Helpers$effect(_elm_lang$core$Platform_Cmd$none);
var _debois$elm_mdl$Material_Helpers$filter = F3(
	function (elem, attr, html) {
		return A2(
			elem,
			attr,
			A2(
				_elm_lang$core$List$filterMap,
				function (x) {
					return x;
				},
				html));
	});

var _debois$elm_mdl$Material_Component$subs = F5(
	function (ctor, get, subscriptions, lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			A3(
				_elm_lang$core$Dict$foldl,
				F3(
					function (idx, model, ss) {
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Platform_Sub$map,
								function (_p0) {
									return lift(
										A2(ctor, idx, _p0));
								},
								subscriptions(model)),
							_1: ss
						};
					}),
				{ctor: '[]'},
				get(model)));
	});
var _debois$elm_mdl$Material_Component$generalise = F4(
	function (update, lift, msg, model) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map2nd,
			_elm_lang$core$Platform_Cmd$map(lift),
			A2(
				_debois$elm_mdl$Material_Helpers$map1st,
				_elm_lang$core$Maybe$Just,
				A2(update, msg, model)));
	});
var _debois$elm_mdl$Material_Component$react = F8(
	function (get, set, ctor, update, lift, msg, idx, store) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			_elm_lang$core$Maybe$map(
				A2(set, idx, store)),
			A3(
				update,
				function (_p1) {
					return lift(
						A2(ctor, idx, _p1));
				},
				msg,
				A2(get, idx, store)));
	});
var _debois$elm_mdl$Material_Component$react1 = F7(
	function (get, set, ctor, update, lift, msg, store) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			_elm_lang$core$Maybe$map(
				set(store)),
			A3(
				update,
				function (_p2) {
					return lift(
						ctor(_p2));
				},
				msg,
				get(store)));
	});
var _debois$elm_mdl$Material_Component$render = F6(
	function (get_model, view, ctor, lift, idx, store) {
		return A2(
			view,
			function (_p3) {
				return lift(
					A2(ctor, idx, _p3));
			},
			A2(get_model, idx, store));
	});
var _debois$elm_mdl$Material_Component$render1 = F5(
	function (get_model, view, ctor, lift, store) {
		return A2(
			view,
			function (_p4) {
				return lift(
					ctor(_p4));
			},
			get_model(store));
	});
var _debois$elm_mdl$Material_Component$indexed = F3(
	function (get_model, set_model, model0) {
		var set_ = F3(
			function (idx, store, model) {
				return A2(
					set_model,
					A3(
						_elm_lang$core$Dict$insert,
						idx,
						model,
						get_model(store)),
					store);
			});
		var get_ = F2(
			function (idx, store) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					model0,
					A2(
						_elm_lang$core$Dict$get,
						idx,
						get_model(store)));
			});
		return {ctor: '_Tuple2', _0: get_, _1: set_};
	});
var _debois$elm_mdl$Material_Component$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};
var _debois$elm_mdl$Material_Component$SelectMsg = F2(
	function (a, b) {
		return {ctor: 'SelectMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$TabsMsg = F2(
	function (a, b) {
		return {ctor: 'TabsMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$TooltipMsg = F2(
	function (a, b) {
		return {ctor: 'TooltipMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$TogglesMsg = F2(
	function (a, b) {
		return {ctor: 'TogglesMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$LayoutMsg = function (a) {
	return {ctor: 'LayoutMsg', _0: a};
};
var _debois$elm_mdl$Material_Component$MenuMsg = F2(
	function (a, b) {
		return {ctor: 'MenuMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$TextfieldMsg = F2(
	function (a, b) {
		return {ctor: 'TextfieldMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Component$ButtonMsg = F2(
	function (a, b) {
		return {ctor: 'ButtonMsg', _0: a, _1: b};
	});

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _debois$elm_mdl$Material_Dispatch$split = F4(
	function (k0, same, differ, xs) {
		split:
		while (true) {
			var _p0 = xs;
			if (_p0.ctor === '[]') {
				return {ctor: '_Tuple2', _0: same, _1: differ};
			} else {
				var _p1 = _p0._1;
				if (_elm_lang$core$Native_Utils.eq(_p0._0._0, k0)) {
					var _v1 = k0,
						_v2 = {ctor: '::', _0: _p0._0._1, _1: same},
						_v3 = differ,
						_v4 = _p1;
					k0 = _v1;
					same = _v2;
					differ = _v3;
					xs = _v4;
					continue split;
				} else {
					var _v5 = k0,
						_v6 = same,
						_v7 = {ctor: '::', _0: _p0._0, _1: differ},
						_v8 = _p1;
					k0 = _v5;
					same = _v6;
					differ = _v7;
					xs = _v8;
					continue split;
				}
			}
		}
	});
var _debois$elm_mdl$Material_Dispatch$group_ = F2(
	function (acc, items) {
		group_:
		while (true) {
			var _p2 = items;
			if (_p2.ctor === '[]') {
				return acc;
			} else {
				if (_p2._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _p2._0._0,
							_1: {
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							}
						},
						_1: acc
					};
				} else {
					if ((_p2._1._0.ctor === '_Tuple2') && (_p2._1._1.ctor === '[]')) {
						var _p6 = _p2._1._0._1;
						var _p5 = _p2._0._1;
						var _p4 = _p2._1._0._0;
						var _p3 = _p2._0._0;
						return _elm_lang$core$Native_Utils.eq(_p3, _p4) ? {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p3,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								}
							},
							_1: acc
						} : {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p4,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {ctor: '[]'}
								}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p3,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								},
								_1: acc
							}
						};
					} else {
						var _p8 = _p2._0._0;
						var _p7 = A4(
							_debois$elm_mdl$Material_Dispatch$split,
							_p8,
							{
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							},
							{ctor: '[]'},
							_p2._1);
						var same = _p7._0;
						var different = _p7._1;
						var _v10 = {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p8, _1: same},
							_1: acc
						},
							_v11 = different;
						acc = _v10;
						items = _v11;
						continue group_;
					}
				}
			}
		}
	});
var _debois$elm_mdl$Material_Dispatch$group = _debois$elm_mdl$Material_Dispatch$group_(
	{ctor: '[]'});
var _debois$elm_mdl$Material_Dispatch$onSingle = function (_p9) {
	var _p10 = _p9;
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		_p10._0,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html_Events$defaultOptions, _p10._1._1),
		_p10._1._0);
};
var _debois$elm_mdl$Material_Dispatch$pickOptions = function (decoders) {
	pickOptions:
	while (true) {
		var _p11 = decoders;
		if (_p11.ctor === '::') {
			if ((_p11._0.ctor === '_Tuple2') && (_p11._0._1.ctor === 'Just')) {
				return _p11._0._1._0;
			} else {
				var _v14 = _p11._1;
				decoders = _v14;
				continue pickOptions;
			}
		} else {
			return _elm_lang$html$Html_Events$defaultOptions;
		}
	}
};
var _debois$elm_mdl$Material_Dispatch$flatten = function (decoders) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		function (value) {
			return A2(
				_elm_lang$core$List$filterMap,
				function (decoder) {
					return _elm_lang$core$Result$toMaybe(
						A2(_elm_lang$core$Json_Decode$decodeValue, decoder, value));
				},
				decoders);
		},
		_elm_lang$core$Json_Decode$value);
};
var _debois$elm_mdl$Material_Dispatch$onWithOptions = F4(
	function (event, lift, options, decoders) {
		return A3(
			_elm_lang$html$Html_Events$onWithOptions,
			event,
			options,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_debois$elm_mdl$Material_Dispatch$flatten(decoders)));
	});
var _debois$elm_mdl$Material_Dispatch$on = F2(
	function (event, lift) {
		return A3(_debois$elm_mdl$Material_Dispatch$onWithOptions, event, lift, _elm_lang$html$Html_Events$defaultOptions);
	});
var _debois$elm_mdl$Material_Dispatch$onMany = F2(
	function (lift, decoders) {
		var _p12 = decoders;
		if ((_p12._1.ctor === '::') && (_p12._1._1.ctor === '[]')) {
			return _debois$elm_mdl$Material_Dispatch$onSingle(
				{ctor: '_Tuple2', _0: _p12._0, _1: _p12._1._0});
		} else {
			var _p13 = _p12._1;
			return A3(
				_elm_lang$html$Html_Events$onWithOptions,
				_p12._0,
				_debois$elm_mdl$Material_Dispatch$pickOptions(_p13),
				lift(
					_debois$elm_mdl$Material_Dispatch$flatten(
						A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, _p13))));
		}
	});
var _debois$elm_mdl$Material_Dispatch$map2nd = F2(
	function (f, _p14) {
		var _p15 = _p14;
		return {
			ctor: '_Tuple2',
			_0: _p15._0,
			_1: f(_p15._1)
		};
	});
var _debois$elm_mdl$Material_Dispatch$update1 = F3(
	function (update, cmd, _p16) {
		var _p17 = _p16;
		return A2(
			_debois$elm_mdl$Material_Dispatch$map2nd,
			A2(
				_elm_lang$core$Basics$flip,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				_p17._1),
			A2(update, cmd, _p17._0));
	});
var _debois$elm_mdl$Material_Dispatch$update = F3(
	function (update, msg, model) {
		return A2(
			_debois$elm_mdl$Material_Dispatch$map2nd,
			_elm_lang$core$Platform_Cmd$batch,
			A3(
				_elm_lang$core$List$foldl,
				_debois$elm_mdl$Material_Dispatch$update1(update),
				{
					ctor: '_Tuple2',
					_0: model,
					_1: {ctor: '[]'}
				},
				msg));
	});
var _debois$elm_mdl$Material_Dispatch$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _debois$elm_mdl$Material_Dispatch$forward = function (messages) {
	return _elm_lang$core$Platform_Cmd$batch(
		A2(_elm_lang$core$List$map, _debois$elm_mdl$Material_Dispatch$cmd, messages));
};
var _debois$elm_mdl$Material_Dispatch$toAttributes = function (_p18) {
	var _p19 = _p18;
	var _p21 = _p19._0;
	var _p20 = _p21.lift;
	if (_p20.ctor === 'Just') {
		return A2(
			_elm_lang$core$List$map,
			_debois$elm_mdl$Material_Dispatch$onMany(_p20._0),
			_debois$elm_mdl$Material_Dispatch$group(_p21.decoders));
	} else {
		return A2(_elm_lang$core$List$map, _debois$elm_mdl$Material_Dispatch$onSingle, _p21.decoders);
	}
};
var _debois$elm_mdl$Material_Dispatch$getDecoder = function (_p22) {
	var _p23 = _p22;
	return _p23._0.lift;
};
var _debois$elm_mdl$Material_Dispatch$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _debois$elm_mdl$Material_Dispatch$defaultConfig = _debois$elm_mdl$Material_Dispatch$Config(
	{
		decoders: {ctor: '[]'},
		lift: _elm_lang$core$Maybe$Nothing
	});
var _debois$elm_mdl$Material_Dispatch$setDecoder = F2(
	function (f, _p24) {
		var _p25 = _p24;
		return _debois$elm_mdl$Material_Dispatch$Config(
			_elm_lang$core$Native_Utils.update(
				_p25._0,
				{
					lift: _elm_lang$core$Maybe$Just(f)
				}));
	});
var _debois$elm_mdl$Material_Dispatch$setMsg = function (_p26) {
	return _debois$elm_mdl$Material_Dispatch$setDecoder(
		_elm_lang$core$Json_Decode$map(_p26));
};
var _debois$elm_mdl$Material_Dispatch$add = F4(
	function (event, options, decoder, _p27) {
		var _p28 = _p27;
		var _p29 = _p28._0;
		return _debois$elm_mdl$Material_Dispatch$Config(
			_elm_lang$core$Native_Utils.update(
				_p29,
				{
					decoders: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: event,
							_1: {ctor: '_Tuple2', _0: decoder, _1: options}
						},
						_1: _p29.decoders
					}
				}));
	});
var _debois$elm_mdl$Material_Dispatch$clear = function (_p30) {
	var _p31 = _p30;
	return _debois$elm_mdl$Material_Dispatch$Config(
		_elm_lang$core$Native_Utils.update(
			_p31._0,
			{
				decoders: {ctor: '[]'}
			}));
};

var _debois$elm_mdl$Material_Options_Internal$addAttributes = F2(
	function (summary, attrs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			summary.attrs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(summary.css),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$String$join, ' ', summary.classes)),
						_1: {ctor: '[]'}
					}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					attrs,
					A2(
						_elm_lang$core$Basics_ops['++'],
						summary.internal,
						_debois$elm_mdl$Material_Dispatch$toAttributes(summary.dispatch)))));
	});
var _debois$elm_mdl$Material_Options_Internal$collect1_ = F2(
	function (options, acc) {
		var _p0 = options;
		switch (_p0.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p0._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p0._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p0._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p0._0, _1: acc.internal}
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_debois$elm_mdl$Material_Dispatch$add, _p0._0, _p0._1, _p0._2, acc.dispatch)
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _debois$elm_mdl$Material_Options_Internal$collect1_, acc, _p0._0);
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_debois$elm_mdl$Material_Dispatch$setDecoder, _p0._0, acc.dispatch)
					});
			case 'Set':
				return acc;
			default:
				return acc;
		}
	});
var _debois$elm_mdl$Material_Options_Internal$collect1 = F2(
	function (option, acc) {
		var _p1 = option;
		switch (_p1.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p1._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p1._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p1._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p1._0, _1: acc.internal}
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _debois$elm_mdl$Material_Options_Internal$collect1, acc, _p1._0);
			case 'Set':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						config: _p1._0(acc.config)
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_debois$elm_mdl$Material_Dispatch$add, _p1._0, _p1._1, _p1._2, acc.dispatch)
					});
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_debois$elm_mdl$Material_Dispatch$setDecoder, _p1._0, acc.dispatch)
					});
			default:
				return acc;
		}
	});
var _debois$elm_mdl$Material_Options_Internal$recollect = _elm_lang$core$List$foldl(_debois$elm_mdl$Material_Options_Internal$collect1);
var _debois$elm_mdl$Material_Options_Internal$apply = F4(
	function (summary, ctor, options, attrs) {
		return ctor(
			A2(
				_debois$elm_mdl$Material_Options_Internal$addAttributes,
				A2(_debois$elm_mdl$Material_Options_Internal$recollect, summary, options),
				attrs));
	});
var _debois$elm_mdl$Material_Options_Internal$Summary = F6(
	function (a, b, c, d, e, f) {
		return {classes: a, css: b, attrs: c, internal: d, dispatch: e, config: f};
	});
var _debois$elm_mdl$Material_Options_Internal$collect = function (_p2) {
	return _debois$elm_mdl$Material_Options_Internal$recollect(
		A6(
			_debois$elm_mdl$Material_Options_Internal$Summary,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			_debois$elm_mdl$Material_Dispatch$defaultConfig,
			_p2));
};
var _debois$elm_mdl$Material_Options_Internal$collect_ = A2(
	_elm_lang$core$List$foldl,
	_debois$elm_mdl$Material_Options_Internal$collect1_,
	A6(
		_debois$elm_mdl$Material_Options_Internal$Summary,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		_debois$elm_mdl$Material_Dispatch$defaultConfig,
		{ctor: '_Tuple0'}));
var _debois$elm_mdl$Material_Options_Internal$None = {ctor: 'None'};
var _debois$elm_mdl$Material_Options_Internal$Lift = function (a) {
	return {ctor: 'Lift', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$dispatch = function (lift) {
	return _debois$elm_mdl$Material_Options_Internal$Lift(
		function (_p3) {
			return A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				A2(_elm_lang$core$Json_Decode$map, _debois$elm_mdl$Material_Component$Dispatch, _p3));
		});
};
var _debois$elm_mdl$Material_Options_Internal$inject = F5(
	function (view, lift, a, b, c) {
		return A3(
			view,
			a,
			b,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options_Internal$dispatch(lift),
				_1: c
			});
	});
var _debois$elm_mdl$Material_Options_Internal$Listener = F3(
	function (a, b, c) {
		return {ctor: 'Listener', _0: a, _1: b, _2: c};
	});
var _debois$elm_mdl$Material_Options_Internal$on1 = F3(
	function (event, lift, m) {
		return A3(
			_debois$elm_mdl$Material_Options_Internal$Listener,
			event,
			_elm_lang$core$Maybe$Nothing,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_elm_lang$core$Json_Decode$succeed(m)));
	});
var _debois$elm_mdl$Material_Options_Internal$Set = function (a) {
	return {ctor: 'Set', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$option = _debois$elm_mdl$Material_Options_Internal$Set;
var _debois$elm_mdl$Material_Options_Internal$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$applyContainer = F3(
	function (summary, ctor, options) {
		return A4(
			_debois$elm_mdl$Material_Options_Internal$apply,
			_elm_lang$core$Native_Utils.update(
				summary,
				{
					dispatch: _debois$elm_mdl$Material_Dispatch$clear(summary.dispatch),
					attrs: {ctor: '[]'},
					internal: {ctor: '[]'},
					config: {ctor: '_Tuple0'}
				}),
			ctor,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options_Internal$Many(summary.config.container),
				_1: options
			},
			{ctor: '[]'});
	});
var _debois$elm_mdl$Material_Options_Internal$applyInput = F3(
	function (summary, ctor, options) {
		return A4(
			_debois$elm_mdl$Material_Options_Internal$apply,
			_elm_lang$core$Native_Utils.update(
				summary,
				{
					classes: {ctor: '[]'},
					css: {ctor: '[]'},
					config: {ctor: '_Tuple0'}
				}),
			ctor,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options_Internal$Many(summary.config.input),
				_1: options
			},
			{ctor: '[]'});
	});
var _debois$elm_mdl$Material_Options_Internal$input = function (_p4) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (style, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						input: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options_Internal$Many(style),
							_1: config.input
						}
					});
			})(_p4));
};
var _debois$elm_mdl$Material_Options_Internal$container = function (_p5) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (style, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						container: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options_Internal$Many(style),
							_1: config.container
						}
					});
			})(_p5));
};
var _debois$elm_mdl$Material_Options_Internal$Internal = function (a) {
	return {ctor: 'Internal', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$attribute = _debois$elm_mdl$Material_Options_Internal$Internal;
var _debois$elm_mdl$Material_Options_Internal$Attribute = function (a) {
	return {ctor: 'Attribute', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$CSS = function (a) {
	return {ctor: 'CSS', _0: a};
};
var _debois$elm_mdl$Material_Options_Internal$Class = function (a) {
	return {ctor: 'Class', _0: a};
};

var _debois$elm_mdl$Material_Options$dispatch = function (_p0) {
	return _debois$elm_mdl$Material_Options_Internal$Lift(
		_elm_lang$core$Json_Decode$map(_p0));
};
var _debois$elm_mdl$Material_Options$onWithOptions = F2(
	function (evt, options) {
		return A2(
			_debois$elm_mdl$Material_Options_Internal$Listener,
			evt,
			_elm_lang$core$Maybe$Just(options));
	});
var _debois$elm_mdl$Material_Options$on = function (event) {
	return A2(_debois$elm_mdl$Material_Options_Internal$Listener, event, _elm_lang$core$Maybe$Nothing);
};
var _debois$elm_mdl$Material_Options$on1 = F2(
	function (event, m) {
		return A2(
			_debois$elm_mdl$Material_Options$on,
			event,
			_elm_lang$core$Json_Decode$succeed(m));
	});
var _debois$elm_mdl$Material_Options$onToggle = _debois$elm_mdl$Material_Options$on1('change');
var _debois$elm_mdl$Material_Options$onClick = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onDoubleClick = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseDown = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseUp = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseEnter = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseLeave = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseOver = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onMouseOut = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onCheck = function (_p1) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'change',
		A3(_elm_lang$core$Basics$flip, _elm_lang$core$Json_Decode$map, _elm_lang$html$Html_Events$targetChecked, _p1));
};
var _debois$elm_mdl$Material_Options$onBlur = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onFocus = function (msg) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _debois$elm_mdl$Material_Options$onInput = function (f) {
	return A2(
		_debois$elm_mdl$Material_Options$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _debois$elm_mdl$Material_Options$container = _debois$elm_mdl$Material_Options_Internal$container;
var _debois$elm_mdl$Material_Options$input = _debois$elm_mdl$Material_Options_Internal$input;
var _debois$elm_mdl$Material_Options$id = function (_p2) {
	return _debois$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$id(_p2));
};
var _debois$elm_mdl$Material_Options$attribute = _debois$elm_mdl$Material_Options_Internal$Attribute;
var _debois$elm_mdl$Material_Options$stylesheet = function (css) {
	return A3(
		_elm_lang$html$Html$node,
		'style',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(css),
			_1: {ctor: '[]'}
		});
};
var _debois$elm_mdl$Material_Options$data = F2(
	function (key, val) {
		return _debois$elm_mdl$Material_Options_Internal$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'data-', key),
				val));
	});
var _debois$elm_mdl$Material_Options$nop = _debois$elm_mdl$Material_Options_Internal$None;
var _debois$elm_mdl$Material_Options$when = F2(
	function (guard, prop) {
		return guard ? prop : _debois$elm_mdl$Material_Options$nop;
	});
var _debois$elm_mdl$Material_Options$maybe = function (prop) {
	return A2(_elm_lang$core$Maybe$withDefault, _debois$elm_mdl$Material_Options$nop, prop);
};
var _debois$elm_mdl$Material_Options$many = _debois$elm_mdl$Material_Options_Internal$Many;
var _debois$elm_mdl$Material_Options$css = F2(
	function (key, value) {
		return _debois$elm_mdl$Material_Options_Internal$CSS(
			{ctor: '_Tuple2', _0: key, _1: value});
	});
var _debois$elm_mdl$Material_Options$center = _debois$elm_mdl$Material_Options$many(
	{
		ctor: '::',
		_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
		_1: {
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'center'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'justify-content', 'center'),
				_1: {ctor: '[]'}
			}
		}
	});
var _debois$elm_mdl$Material_Options$scrim = function (opacity) {
	return A2(
		_debois$elm_mdl$Material_Options$css,
		'background',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(opacity),
				'))')));
};
var _debois$elm_mdl$Material_Options$cs = function (c) {
	return _debois$elm_mdl$Material_Options_Internal$Class(c);
};
var _debois$elm_mdl$Material_Options$disabled = function (v) {
	return _debois$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$disabled(v));
};
var _debois$elm_mdl$Material_Options$styled_ = F3(
	function (ctor, props, attrs) {
		return ctor(
			A2(
				_debois$elm_mdl$Material_Options_Internal$addAttributes,
				_debois$elm_mdl$Material_Options_Internal$collect_(props),
				attrs));
	});
var _debois$elm_mdl$Material_Options$img = F2(
	function (options, attrs) {
		return A4(
			_debois$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			options,
			attrs,
			{ctor: '[]'});
	});
var _debois$elm_mdl$Material_Options$styled = F2(
	function (ctor, props) {
		return ctor(
			A2(
				_debois$elm_mdl$Material_Options_Internal$addAttributes,
				_debois$elm_mdl$Material_Options_Internal$collect_(props),
				{ctor: '[]'}));
	});
var _debois$elm_mdl$Material_Options$div = _debois$elm_mdl$Material_Options$styled(_elm_lang$html$Html$div);
var _debois$elm_mdl$Material_Options$span = _debois$elm_mdl$Material_Options$styled(_elm_lang$html$Html$span);

var _debois$elm_mdl$Material_Ripple$styles = F2(
	function (m, frame) {
		var r = m.rect;
		var toPx = function (k) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Basics$round(k)),
				'px');
		};
		var offset = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				toPx(m.x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						toPx(m.y),
						')'))));
		var rippleSize = toPx(
			(_elm_lang$core$Basics$sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
		var scale = _elm_lang$core$Native_Utils.eq(frame, 0) ? 'scale(0.0001, 0.0001)' : '';
		var transformString = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(-50%, -50%) ',
			A2(_elm_lang$core$Basics_ops['++'], offset, scale));
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'width', _1: rippleSize},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'height', _1: rippleSize},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: '-webkit-transform', _1: transformString},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: '-ms-transform', _1: transformString},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'transform', _1: transformString},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
	});
var _debois$elm_mdl$Material_Ripple$Metrics = F3(
	function (a, b, c) {
		return {rect: a, x: b, y: c};
	});
var _debois$elm_mdl$Material_Ripple$computeMetrics = function (g) {
	var rect = g.rect;
	var set = F2(
		function (x, y) {
			return _elm_lang$core$Maybe$Just(
				{ctor: '_Tuple2', _0: x - rect.left, _1: y - rect.top});
		});
	return A2(
		_elm_lang$core$Maybe$map,
		function (_p0) {
			var _p1 = _p0;
			return A3(_debois$elm_mdl$Material_Ripple$Metrics, rect, _p1._0, _p1._1);
		},
		function () {
			var _p2 = {ctor: '_Tuple4', _0: g.clientX, _1: g.clientY, _2: g.touchX, _3: g.touchY};
			_v1_3:
			do {
				if (_p2.ctor === '_Tuple4') {
					if ((_p2._0.ctor === 'Just') && (_p2._1.ctor === 'Just')) {
						if ((_p2._0._0 === 0.0) && (_p2._1._0 === 0.0)) {
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: rect.width / 2.0, _1: rect.height / 2.0});
						} else {
							return A2(set, _p2._0._0, _p2._1._0);
						}
					} else {
						if ((_p2._2.ctor === 'Just') && (_p2._3.ctor === 'Just')) {
							return A2(set, _p2._2._0, _p2._3._0);
						} else {
							break _v1_3;
						}
					}
				} else {
					break _v1_3;
				}
			} while(false);
			return _elm_lang$core$Maybe$Nothing;
		}());
};
var _debois$elm_mdl$Material_Ripple$Model = F3(
	function (a, b, c) {
		return {animation: a, metrics: b, ignoringMouseDown: c};
	});
var _debois$elm_mdl$Material_Ripple$DOMState = F6(
	function (a, b, c, d, e, f) {
		return {rect: a, clientX: b, clientY: c, touchX: d, touchY: e, type_: f};
	});
var _debois$elm_mdl$Material_Ripple$geometryDecoder = A7(
	_elm_lang$core$Json_Decode$map6,
	_debois$elm_mdl$Material_Ripple$DOMState,
	A2(_elm_lang$core$Json_Decode$field, 'currentTarget', _debois$elm_dom$DOM$boundingClientRect),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientX', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientY', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientX',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientY',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string));
var _debois$elm_mdl$Material_Ripple$Inert = {ctor: 'Inert'};
var _debois$elm_mdl$Material_Ripple$model = {animation: _debois$elm_mdl$Material_Ripple$Inert, metrics: _elm_lang$core$Maybe$Nothing, ignoringMouseDown: false};
var _debois$elm_mdl$Material_Ripple$Frame = function (a) {
	return {ctor: 'Frame', _0: a};
};
var _debois$elm_mdl$Material_Ripple$view_ = F2(
	function (attrs, model) {
		var styling = function () {
			var _p3 = {ctor: '_Tuple2', _0: model.metrics, _1: model.animation};
			if ((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) {
				if (_p3._1.ctor === 'Frame') {
					return A2(_debois$elm_mdl$Material_Ripple$styles, _p3._0._0, _p3._1._0);
				} else {
					return A2(_debois$elm_mdl$Material_Ripple$styles, _p3._0._0, 1);
				}
			} else {
				return {ctor: '[]'};
			}
		}();
		return A2(
			_elm_lang$html$Html$span,
			attrs,
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-ripple', _1: true},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'is-animating',
										_1: !_elm_lang$core$Native_Utils.eq(
											model.animation,
											_debois$elm_mdl$Material_Ripple$Frame(0))
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'is-visible',
											_1: !_elm_lang$core$Native_Utils.eq(model.animation, _debois$elm_mdl$Material_Ripple$Inert)
										},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(styling),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_Ripple$Tick = {ctor: 'Tick'};
var _debois$elm_mdl$Material_Ripple$update = F2(
	function (action, model) {
		var _p4 = action;
		switch (_p4.ctor) {
			case 'Down':
				var _p5 = _p4._0;
				return (_elm_lang$core$Native_Utils.eq(_p5.type_, 'mousedown') && model.ignoringMouseDown) ? _debois$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{ignoringMouseDown: false})) : A2(
					_debois$elm_mdl$Material_Helpers$effect,
					_debois$elm_mdl$Material_Helpers$cssTransitionStep(_debois$elm_mdl$Material_Ripple$Tick),
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _debois$elm_mdl$Material_Ripple$Frame(0),
							metrics: _debois$elm_mdl$Material_Ripple$computeMetrics(_p5),
							ignoringMouseDown: _elm_lang$core$Native_Utils.eq(_p5.type_, 'touchstart') ? true : model.ignoringMouseDown
						}));
			case 'Up':
				return _debois$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{animation: _debois$elm_mdl$Material_Ripple$Inert}));
			default:
				return _elm_lang$core$Native_Utils.eq(
					model.animation,
					_debois$elm_mdl$Material_Ripple$Frame(0)) ? _debois$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _debois$elm_mdl$Material_Ripple$Frame(1)
						})) : _debois$elm_mdl$Material_Helpers$pure(model);
		}
	});
var _debois$elm_mdl$Material_Ripple$Up = {ctor: 'Up'};
var _debois$elm_mdl$Material_Ripple$up = F2(
	function (f, name) {
		return A2(
			_debois$elm_mdl$Material_Options$on,
			name,
			_elm_lang$core$Json_Decode$succeed(
				f(_debois$elm_mdl$Material_Ripple$Up)));
	});
var _debois$elm_mdl$Material_Ripple$upOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(
				f(_debois$elm_mdl$Material_Ripple$Up)));
	});
var _debois$elm_mdl$Material_Ripple$upOn = _debois$elm_mdl$Material_Ripple$upOn_(_elm_lang$core$Basics$identity);
var _debois$elm_mdl$Material_Ripple$Down = function (a) {
	return {ctor: 'Down', _0: a};
};
var _debois$elm_mdl$Material_Ripple$downOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p6) {
					return f(
						_debois$elm_mdl$Material_Ripple$Down(_p6));
				},
				_debois$elm_mdl$Material_Ripple$geometryDecoder));
	});
var _debois$elm_mdl$Material_Ripple$downOn = _debois$elm_mdl$Material_Ripple$downOn_(_elm_lang$core$Basics$identity);
var _debois$elm_mdl$Material_Ripple$view = function (_p7) {
	return _debois$elm_mdl$Material_Ripple$view_(
		A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$List$append,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Ripple$upOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Ripple$upOn('mouseleave'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Ripple$upOn('touchend'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Ripple$upOn('blur'),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Ripple$downOn('mousedown'),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Ripple$downOn('touchstart'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			_p7));
};
var _debois$elm_mdl$Material_Ripple$down = F2(
	function (f, name) {
		return A2(
			_debois$elm_mdl$Material_Options$on,
			name,
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p8) {
					return f(
						_debois$elm_mdl$Material_Ripple$Down(_p8));
				},
				_debois$elm_mdl$Material_Ripple$geometryDecoder));
	});

var _debois$elm_mdl$Material_Button$_p0 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.button;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{button: x});
		}),
	_debois$elm_mdl$Material_Ripple$model);
var _debois$elm_mdl$Material_Button$get = _debois$elm_mdl$Material_Button$_p0._0;
var _debois$elm_mdl$Material_Button$set = _debois$elm_mdl$Material_Button$_p0._1;
var _debois$elm_mdl$Material_Button$icon = _debois$elm_mdl$Material_Options$cs('mdl-button--icon');
var _debois$elm_mdl$Material_Button$fab = _debois$elm_mdl$Material_Options$cs('mdl-button--fab');
var _debois$elm_mdl$Material_Button$minifab = _debois$elm_mdl$Material_Options$many(
	{
		ctor: '::',
		_0: _debois$elm_mdl$Material_Options$cs('mdl-button--mini-fab'),
		_1: {
			ctor: '::',
			_0: _debois$elm_mdl$Material_Button$fab,
			_1: {ctor: '[]'}
		}
	});
var _debois$elm_mdl$Material_Button$raised = _debois$elm_mdl$Material_Options$cs('mdl-button--raised');
var _debois$elm_mdl$Material_Button$flat = _debois$elm_mdl$Material_Options$nop;
var _debois$elm_mdl$Material_Button$blurAndForward = function (event) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', event),
		'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));');
};
var _debois$elm_mdl$Material_Button$type_ = function (_p1) {
	return _debois$elm_mdl$Material_Options_Internal$attribute(
		_elm_lang$html$Html_Attributes$type_(_p1));
};
var _debois$elm_mdl$Material_Button$accent = _debois$elm_mdl$Material_Options$cs('mdl-button--accent');
var _debois$elm_mdl$Material_Button$primary = _debois$elm_mdl$Material_Options$cs('mdl-button--primary');
var _debois$elm_mdl$Material_Button$colored = _debois$elm_mdl$Material_Options$cs('mdl-button--colored');
var _debois$elm_mdl$Material_Button$plain = _debois$elm_mdl$Material_Options$nop;
var _debois$elm_mdl$Material_Button$disabled = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _debois$elm_mdl$Material_Button$ripple = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _debois$elm_mdl$Material_Button$link = function (href) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					link: _elm_lang$core$Maybe$Just(href)
				});
		});
};
var _debois$elm_mdl$Material_Button$defaultConfig = {ripple: false, link: _elm_lang$core$Maybe$Nothing, disabled: false};
var _debois$elm_mdl$Material_Button$view = F4(
	function (lift, model, options, html) {
		var listeners = _debois$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Ripple$down, lift, 'mousedown'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Ripple$down, lift, 'touchstart'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Ripple$up, lift, 'touchcancel'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Ripple$up, lift, 'mouseup'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Ripple$up, lift, 'blur'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Ripple$up, lift, 'mouseleave'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
		var _p2 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Button$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$html$Html$a : _elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-button'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-js-button'),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							summary.config.ripple,
							_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect')),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'box-sizing', 'border-box'),
							_1: {
								ctor: '::',
								_0: listeners,
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) && (!config.disabled),
										_debois$elm_mdl$Material_Options_Internal$attribute(
											_elm_lang$html$Html_Attributes$href(
												A2(_elm_lang$core$Maybe$withDefault, '', config.link)))),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											config.disabled,
											_debois$elm_mdl$Material_Options_Internal$attribute(
												_elm_lang$html$Html_Attributes$disabled(true))),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												config.disabled,
												_debois$elm_mdl$Material_Options$cs('mdl-button--disabled')),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Helpers$blurOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Helpers$blurOn('mouseleave'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Helpers$blurOn('touchend'),
						_1: {ctor: '[]'}
					}
				}
			},
			config.ripple ? _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: html,
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								lift,
								A2(
									_debois$elm_mdl$Material_Ripple$view_,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-button__ripple-container'),
										_1: {ctor: '[]'}
									},
									model)),
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				}) : html);
	});
var _debois$elm_mdl$Material_Button$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Button$get, _debois$elm_mdl$Material_Button$view, _debois$elm_mdl$Material_Component$ButtonMsg);
var _debois$elm_mdl$Material_Button$update = function (action) {
	return _debois$elm_mdl$Material_Ripple$update(action);
};
var _debois$elm_mdl$Material_Button$react = A4(
	_debois$elm_mdl$Material_Component$react,
	_debois$elm_mdl$Material_Button$get,
	_debois$elm_mdl$Material_Button$set,
	_debois$elm_mdl$Material_Component$ButtonMsg,
	_debois$elm_mdl$Material_Component$generalise(_debois$elm_mdl$Material_Button$update));
var _debois$elm_mdl$Material_Button$defaultModel = _debois$elm_mdl$Material_Ripple$model;
var _debois$elm_mdl$Material_Button$Config = F3(
	function (a, b, c) {
		return {ripple: a, link: b, disabled: c};
	});

var _debois$elm_mdl$Material_Icon$view = F2(
	function (name, options) {
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('material-icons'),
				_1: options
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(name),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_Icon$i = function (name) {
	return A2(
		_debois$elm_mdl$Material_Icon$view,
		name,
		{ctor: '[]'});
};
var _debois$elm_mdl$Material_Icon$size48 = A2(_debois$elm_mdl$Material_Options$css, 'font-size', '48px');
var _debois$elm_mdl$Material_Icon$size36 = A2(_debois$elm_mdl$Material_Options$css, 'font-size', '36px');
var _debois$elm_mdl$Material_Icon$size24 = A2(_debois$elm_mdl$Material_Options$css, 'font-size', '24px');
var _debois$elm_mdl$Material_Icon$size18 = A2(_debois$elm_mdl$Material_Options$css, 'font-size', '18px');
var _debois$elm_mdl$Material_Icon$defaultConfig = {};
var _debois$elm_mdl$Material_Icon$Config = {};

var _debois$elm_mdl$Material_Textfield$update = F3(
	function (_p0, msg, model) {
		return A3(
			_elm_lang$core$Basics$flip,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Platform_Cmd_ops['!'], x, y);
				}),
			{ctor: '[]'},
			function () {
				var _p1 = msg;
				switch (_p1.ctor) {
					case 'Input':
						var dirty = !_elm_lang$core$Native_Utils.eq(_p1._0, '');
						return _elm_lang$core$Native_Utils.eq(dirty, model.isDirty) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{isDirty: dirty}));
					case 'Blur':
						return _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{isFocused: false}));
					case 'Focus':
						return _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{isFocused: true}));
					default:
						return _elm_lang$core$Maybe$Just(model);
				}
			}());
	});
var _debois$elm_mdl$Material_Textfield$defaultModel = {isFocused: false, isDirty: false};
var _debois$elm_mdl$Material_Textfield$_p2 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.textfield;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{textfield: x});
		}),
	_debois$elm_mdl$Material_Textfield$defaultModel);
var _debois$elm_mdl$Material_Textfield$get = _debois$elm_mdl$Material_Textfield$_p2._0;
var _debois$elm_mdl$Material_Textfield$set = _debois$elm_mdl$Material_Textfield$_p2._1;
var _debois$elm_mdl$Material_Textfield$react = A4(_debois$elm_mdl$Material_Component$react, _debois$elm_mdl$Material_Textfield$get, _debois$elm_mdl$Material_Textfield$set, _debois$elm_mdl$Material_Component$TextfieldMsg, _debois$elm_mdl$Material_Textfield$update);
var _debois$elm_mdl$Material_Textfield$maxRows = function (k) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					maxRows: _elm_lang$core$Maybe$Just(k)
				});
		});
};
var _debois$elm_mdl$Material_Textfield$cols = function (k) {
	return _debois$elm_mdl$Material_Options_Internal$input(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$attribute(
				_elm_lang$html$Html_Attributes$cols(k)),
			_1: {ctor: '[]'}
		});
};
var _debois$elm_mdl$Material_Textfield$rows = function (k) {
	return _debois$elm_mdl$Material_Options_Internal$input(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$attribute(
				_elm_lang$html$Html_Attributes$rows(k)),
			_1: {ctor: '[]'}
		});
};
var _debois$elm_mdl$Material_Textfield$input = _debois$elm_mdl$Material_Options$input;
var _debois$elm_mdl$Material_Textfield$disabled = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _debois$elm_mdl$Material_Textfield$maxlength = function (k) {
	return _debois$elm_mdl$Material_Options$attribute(
		_elm_lang$html$Html_Attributes$maxlength(k));
};
var _debois$elm_mdl$Material_Textfield$autofocus = _debois$elm_mdl$Material_Options$attribute(
	_elm_lang$html$Html_Attributes$autofocus(true));
var _debois$elm_mdl$Material_Textfield$defaultValue = function (_p3) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						defaultValue: _elm_lang$core$Maybe$Just(str)
					});
			})(_p3));
};
var _debois$elm_mdl$Material_Textfield$value = function (_p4) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						value: _elm_lang$core$Maybe$Just(str)
					});
			})(_p4));
};
var _debois$elm_mdl$Material_Textfield$error = function (_p5) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						error: _elm_lang$core$Maybe$Just(str)
					});
			})(_p5));
};
var _debois$elm_mdl$Material_Textfield$expandableIcon = function (id) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{expandableIcon: id});
		});
};
var _debois$elm_mdl$Material_Textfield$expandable = function (id) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					expandable: _elm_lang$core$Maybe$Just(id)
				});
		});
};
var _debois$elm_mdl$Material_Textfield$floatingLabel = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{labelFloat: true});
	});
var _debois$elm_mdl$Material_Textfield$label = function (_p6) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						labelText: _elm_lang$core$Maybe$Just(str)
					});
			})(_p6));
};
var _debois$elm_mdl$Material_Textfield$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {labelText: a, labelFloat: b, error: c, value: d, defaultValue: e, disabled: f, kind: g, expandable: h, expandableIcon: i, input: j, container: k, maxRows: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _debois$elm_mdl$Material_Textfield$Model = F2(
	function (a, b) {
		return {isFocused: a, isDirty: b};
	});
var _debois$elm_mdl$Material_Textfield$Email = {ctor: 'Email'};
var _debois$elm_mdl$Material_Textfield$email = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _debois$elm_mdl$Material_Textfield$Email});
	});
var _debois$elm_mdl$Material_Textfield$Password = {ctor: 'Password'};
var _debois$elm_mdl$Material_Textfield$password = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _debois$elm_mdl$Material_Textfield$Password});
	});
var _debois$elm_mdl$Material_Textfield$Textarea = {ctor: 'Textarea'};
var _debois$elm_mdl$Material_Textfield$textarea = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _debois$elm_mdl$Material_Textfield$Textarea});
	});
var _debois$elm_mdl$Material_Textfield$Text = {ctor: 'Text'};
var _debois$elm_mdl$Material_Textfield$defaultConfig = {
	labelText: _elm_lang$core$Maybe$Nothing,
	labelFloat: false,
	error: _elm_lang$core$Maybe$Nothing,
	value: _elm_lang$core$Maybe$Nothing,
	defaultValue: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	kind: _debois$elm_mdl$Material_Textfield$Text,
	expandable: _elm_lang$core$Maybe$Nothing,
	expandableIcon: 'search',
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	maxRows: _elm_lang$core$Maybe$Nothing
};
var _debois$elm_mdl$Material_Textfield$text_ = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _debois$elm_mdl$Material_Textfield$Text});
	});
var _debois$elm_mdl$Material_Textfield$NoOp = {ctor: 'NoOp'};
var _debois$elm_mdl$Material_Textfield$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _debois$elm_mdl$Material_Textfield$Focus = {ctor: 'Focus'};
var _debois$elm_mdl$Material_Textfield$Blur = {ctor: 'Blur'};
var _debois$elm_mdl$Material_Textfield$view = F4(
	function (lift, model, options, _p7) {
		var _p8 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Textfield$defaultConfig, options);
		var summary = _p8;
		var config = _p8.config;
		var labelFor = function () {
			var _p9 = config.expandable;
			if (_p9.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$for(_p9._0),
					_1: {ctor: '[]'}
				};
			}
		}();
		var expandableId = function () {
			var _p10 = config.expandable;
			if (_p10.ctor === 'Nothing') {
				return _debois$elm_mdl$Material_Options$nop;
			} else {
				return _debois$elm_mdl$Material_Options_Internal$attribute(
					_elm_lang$html$Html_Attributes$id(_p10._0));
			}
		}();
		var preventEnterWhenMaxRowsExceeded = A2(
			_debois$elm_mdl$Material_Options$when,
			_elm_lang$core$Native_Utils.eq(config.kind, _debois$elm_mdl$Material_Textfield$Textarea) && (!_elm_lang$core$Native_Utils.eq(config.maxRows, _elm_lang$core$Maybe$Nothing)),
			A3(
				_debois$elm_mdl$Material_Options$onWithOptions,
				'keydown',
				_elm_lang$core$Native_Utils.update(
					_elm_lang$html$Html_Events$defaultOptions,
					{preventDefault: true}),
				A2(
					_elm_lang$core$Json_Decode$andThen,
					function (_p11) {
						var _p12 = _p11;
						var rows = _elm_lang$core$List$length(
							A2(_elm_lang$core$String$split, '\n', _p12._1));
						return ((_elm_lang$core$Native_Utils.cmp(
							rows,
							A2(_elm_lang$core$Maybe$withDefault, 0, config.maxRows)) > -1) && _elm_lang$core$Native_Utils.eq(_p12._0, 13)) ? _elm_lang$core$Json_Decode$succeed(
							lift(_debois$elm_mdl$Material_Textfield$NoOp)) : _elm_lang$core$Json_Decode$fail('');
					},
					A3(
						_elm_lang$core$Json_Decode$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_elm_lang$html$Html_Events$keyCode,
						_elm_lang$html$Html_Events$targetValue))));
		var expHolder = function () {
			var _p13 = config.expandable;
			if (_p13.ctor === 'Nothing') {
				return _elm_lang$core$Basics$identity;
			} else {
				return function (x) {
					return {
						ctor: '::',
						_0: A4(
							_debois$elm_mdl$Material_Options$styled_,
							_elm_lang$html$Html$label,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$cs('mdl-button'),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$cs('mdl-js-button'),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$cs('mdl-button--icon'),
										_1: {ctor: '[]'}
									}
								}
							},
							labelFor,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Icon$i(config.expandableIcon),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_debois$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$cs('mdl-textfield__expandable-holder'),
									_1: {ctor: '[]'}
								},
								x),
							_1: {ctor: '[]'}
						}
					};
				};
			}
		}();
		return A4(
			_debois$elm_mdl$Material_Options_Internal$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-textfield'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-js-textfield'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: A3(_debois$elm_mdl$Material_Options_Internal$on1, 'focus', lift, _debois$elm_mdl$Material_Textfield$Focus),
							_1: {
								ctor: '::',
								_0: A3(_debois$elm_mdl$Material_Options_Internal$on1, 'blur', lift, _debois$elm_mdl$Material_Textfield$Blur),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										config.labelFloat,
										_debois$elm_mdl$Material_Options$cs('mdl-textfield--floating-label')),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											!_elm_lang$core$Native_Utils.eq(config.error, _elm_lang$core$Maybe$Nothing),
											_debois$elm_mdl$Material_Options$cs('is-invalid')),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												function () {
													var _p14 = config.value;
													if (_p14.ctor === 'Just') {
														if (_p14._0 === '') {
															return false;
														} else {
															return true;
														}
													} else {
														return model.isDirty;
													}
												}(),
												_debois$elm_mdl$Material_Options$cs('is-dirty')),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$when,
													model.isFocused && (!config.disabled),
													_debois$elm_mdl$Material_Options$cs('is-focused')),
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Options$when,
														config.disabled,
														_debois$elm_mdl$Material_Options$cs('is-disabled')),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Options$when,
															!_elm_lang$core$Native_Utils.eq(config.expandable, _elm_lang$core$Maybe$Nothing),
															_debois$elm_mdl$Material_Options$cs('mdl-textfield--expandable')),
														_1: {
															ctor: '::',
															_0: preventEnterWhenMaxRowsExceeded,
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			expHolder(
				{
					ctor: '::',
					_0: A4(
						_debois$elm_mdl$Material_Options_Internal$applyInput,
						summary,
						_elm_lang$core$Native_Utils.eq(config.kind, _debois$elm_mdl$Material_Textfield$Textarea) ? _elm_lang$html$Html$textarea : _elm_lang$html$Html$input,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-textfield__input'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'outline', 'none'),
								_1: {
									ctor: '::',
									_0: A3(_debois$elm_mdl$Material_Options_Internal$on1, 'focus', lift, _debois$elm_mdl$Material_Textfield$Focus),
									_1: {
										ctor: '::',
										_0: A3(_debois$elm_mdl$Material_Options_Internal$on1, 'blur', lift, _debois$elm_mdl$Material_Textfield$Blur),
										_1: {
											ctor: '::',
											_0: function () {
												var _p15 = config.kind;
												switch (_p15.ctor) {
													case 'Text':
														return _debois$elm_mdl$Material_Options_Internal$attribute(
															_elm_lang$html$Html_Attributes$type_('text'));
													case 'Password':
														return _debois$elm_mdl$Material_Options_Internal$attribute(
															_elm_lang$html$Html_Attributes$type_('password'));
													case 'Email':
														return _debois$elm_mdl$Material_Options_Internal$attribute(
															_elm_lang$html$Html_Attributes$type_('email'));
													default:
														return _debois$elm_mdl$Material_Options$nop;
												}
											}(),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$when,
													config.disabled,
													_debois$elm_mdl$Material_Options_Internal$attribute(
														_elm_lang$html$Html_Attributes$disabled(true))),
												_1: {
													ctor: '::',
													_0: expandableId,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$onInput(
															function (_p16) {
																return lift(
																	_debois$elm_mdl$Material_Textfield$Input(_p16));
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Options$when,
																!_elm_lang$core$Native_Utils.eq(config.value, _elm_lang$core$Maybe$Nothing),
																_debois$elm_mdl$Material_Options_Internal$attribute(
																	_elm_lang$html$Html_Attributes$value(
																		A2(_elm_lang$core$Maybe$withDefault, '', config.value)))),
															_1: {
																ctor: '::',
																_0: function () {
																	var _p17 = config.defaultValue;
																	if (_p17.ctor === 'Nothing') {
																		return _debois$elm_mdl$Material_Options$nop;
																	} else {
																		return _debois$elm_mdl$Material_Options_Internal$attribute(
																			_elm_lang$html$Html_Attributes$defaultValue(_p17._0));
																	}
																}(),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$label,
							A2(
								_elm_lang$core$Basics_ops['++'],
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__label'),
									_1: {ctor: '[]'}
								},
								labelFor),
							function () {
								var _p18 = config.labelText;
								if (_p18.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html$text(_p18._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}()),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Maybe$withDefault,
								A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									{ctor: '[]'}),
								A2(
									_elm_lang$core$Maybe$map,
									function (e) {
										return A2(
											_elm_lang$html$Html$span,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__error'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(e),
												_1: {ctor: '[]'}
											});
									},
									config.error)),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _debois$elm_mdl$Material_Textfield$render = F4(
	function (lift, index, store, options) {
		return A7(
			_debois$elm_mdl$Material_Component$render,
			_debois$elm_mdl$Material_Textfield$get,
			_debois$elm_mdl$Material_Textfield$view,
			_debois$elm_mdl$Material_Component$TextfieldMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options_Internal$dispatch(lift),
				_1: options
			});
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _debois$elm_mdl$Material_Dropdown_Geometry$defaultRectangle = {top: 0, left: 0, width: 0, height: 0};
var _debois$elm_mdl$Material_Dropdown_Geometry$defaultElement = {offsetTop: 0, offsetLeft: 0, offsetHeight: 0, bounds: _debois$elm_mdl$Material_Dropdown_Geometry$defaultRectangle};
var _debois$elm_mdl$Material_Dropdown_Geometry$defaultGeometry = {
	button: _debois$elm_mdl$Material_Dropdown_Geometry$defaultElement,
	menu: _debois$elm_mdl$Material_Dropdown_Geometry$defaultElement,
	container: _debois$elm_mdl$Material_Dropdown_Geometry$defaultElement,
	offsetTops: {ctor: '[]'},
	offsetHeights: {ctor: '[]'}
};
var _debois$elm_mdl$Material_Dropdown_Geometry$Geometry = F5(
	function (a, b, c, d, e) {
		return {button: a, menu: b, container: c, offsetTops: d, offsetHeights: e};
	});
var _debois$elm_mdl$Material_Dropdown_Geometry$Element = F4(
	function (a, b, c, d) {
		return {offsetTop: a, offsetLeft: b, offsetHeight: c, bounds: d};
	});
var _debois$elm_mdl$Material_Dropdown_Geometry$element = A5(_elm_lang$core$Json_Decode$map4, _debois$elm_mdl$Material_Dropdown_Geometry$Element, _debois$elm_dom$DOM$offsetTop, _debois$elm_dom$DOM$offsetLeft, _debois$elm_dom$DOM$offsetHeight, _debois$elm_dom$DOM$boundingClientRect);
var _debois$elm_mdl$Material_Dropdown_Geometry$geometry = A6(
	_elm_lang$core$Json_Decode$map5,
	_debois$elm_mdl$Material_Dropdown_Geometry$Geometry,
	_debois$elm_mdl$Material_Dropdown_Geometry$element,
	_debois$elm_dom$DOM$nextSibling(
		A2(_debois$elm_dom$DOM$childNode, 1, _debois$elm_mdl$Material_Dropdown_Geometry$element)),
	_debois$elm_dom$DOM$nextSibling(_debois$elm_mdl$Material_Dropdown_Geometry$element),
	_debois$elm_dom$DOM$nextSibling(
		A2(
			_debois$elm_dom$DOM$childNode,
			1,
			_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetTop))),
	_debois$elm_dom$DOM$nextSibling(
		A2(
			_debois$elm_dom$DOM$childNode,
			1,
			_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetHeight))));

var _debois$elm_mdl$Material_Dropdown_Item$selected = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{selected: true});
	});
var _debois$elm_mdl$Material_Dropdown_Item$options = function (v) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{options: v});
		});
};
var _debois$elm_mdl$Material_Dropdown_Item$ripple = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _debois$elm_mdl$Material_Dropdown_Item$divider = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{divider: true});
	});
var _debois$elm_mdl$Material_Dropdown_Item$disabled = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{enabled: false});
	});
var _debois$elm_mdl$Material_Dropdown_Item$onSelect = function (msg) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelect: _elm_lang$core$Maybe$Just(msg)
				});
		});
};
var _debois$elm_mdl$Material_Dropdown_Item$defaultConfig = {
	onSelect: _elm_lang$core$Maybe$Nothing,
	enabled: true,
	divider: false,
	ripple: false,
	options: {ctor: '[]'},
	selected: false
};
var _debois$elm_mdl$Material_Dropdown_Item$item = F2(
	function (options, html) {
		return {html: html, options: options};
	});
var _debois$elm_mdl$Material_Dropdown_Item$Model = F2(
	function (a, b) {
		return {html: a, options: b};
	});
var _debois$elm_mdl$Material_Dropdown_Item$Config = F6(
	function (a, b, c, d, e, f) {
		return {onSelect: a, enabled: b, divider: c, ripple: d, options: e, selected: f};
	});
var _debois$elm_mdl$Material_Dropdown_Item$Ripple = function (a) {
	return {ctor: 'Ripple', _0: a};
};
var _debois$elm_mdl$Material_Dropdown_Item$Select = function (a) {
	return {ctor: 'Select', _0: a};
};
var _debois$elm_mdl$Material_Dropdown_Item$view = F5(
	function (lift, top, index, model, defaultOptions) {
		var fwdRipple = function (_p0) {
			return lift(
				_debois$elm_mdl$Material_Dropdown_Item$Ripple(_p0));
		};
		var ripple = A2(
			_elm_lang$core$Maybe$withDefault,
			_debois$elm_mdl$Material_Ripple$model,
			A2(_elm_lang$core$Dict$get, index, top.ripples));
		var html = model.html;
		var options = model.options;
		var _p1 = A2(
			_debois$elm_mdl$Material_Options_Internal$collect,
			_debois$elm_mdl$Material_Dropdown_Item$defaultConfig,
			A2(_elm_lang$core$Basics_ops['++'], defaultOptions, options));
		var summary = _p1;
		var config = _p1.config;
		var canSelect = config.enabled && (!_elm_lang$core$Native_Utils.eq(config.onSelect, _elm_lang$core$Maybe$Nothing));
		var hasRipple = config.ripple && canSelect;
		return A2(
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			_elm_lang$core$Basics$toString(index),
			A5(
				_debois$elm_mdl$Material_Options_Internal$apply,
				summary,
				_elm_lang$html$Html$li,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-menu__item'),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							config.ripple,
							_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								config.divider,
								_debois$elm_mdl$Material_Options$cs('mdl-menu__item--full-bleed-divider')),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									config.selected,
									_debois$elm_mdl$Material_Options$cs('mdl-menu__item--selected')),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'center'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: canSelect ? _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Events$onClick(
									lift(
										_debois$elm_mdl$Material_Dropdown_Item$Select(summary.config.onSelect)))) : _elm_lang$core$Maybe$Nothing,
							_1: {
								ctor: '::',
								_0: (!summary.config.enabled) ? _elm_lang$core$Maybe$Just(
									A2(_elm_lang$html$Html_Attributes$attribute, 'disabled', 'disabled')) : _elm_lang$core$Maybe$Nothing,
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Maybe$Just(
										A2(
											_elm_lang$html$Html_Attributes$property,
											'tabIndex',
											_elm_lang$core$Json_Encode$int(-1))),
									_1: {ctor: '[]'}
								}
							}
						}),
					hasRipple ? {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Ripple$downOn_, fwdRipple, 'mousedown'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Ripple$downOn_, fwdRipple, 'touchstart'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'mouseup'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'mouseleave'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'touchend'),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'blur'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					} : {ctor: '[]'}),
				hasRipple ? A2(
					F2(
						function (x, y) {
							return A2(_elm_lang$core$Basics_ops['++'], x, y);
						}),
					html,
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$map,
							fwdRipple,
							A2(
								_debois$elm_mdl$Material_Ripple$view_,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-menu__item-ripple-container'),
									_1: {ctor: '[]'}
								},
								ripple)),
						_1: {ctor: '[]'}
					}) : html));
	});

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _debois$elm_mdl$Material_Dropdown$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _debois$elm_mdl$Material_Dropdown$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_debois$elm_mdl$Material_Dropdown$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _debois$elm_mdl$Material_Dropdown$defaultIndex = F2(
	function (model, defaultValue) {
		return (!_elm_lang$core$Native_Utils.eq(model.index, _elm_lang$core$Maybe$Nothing)) ? model.index : defaultValue;
	});
var _debois$elm_mdl$Material_Dropdown$containerGeometry = F2(
	function (alignment, geometry) {
		var _p1 = alignment;
		switch (_p1.ctor) {
			case 'BottomLeft':
				return {
					top: _elm_lang$core$Maybe$Just(geometry.button.offsetTop + geometry.button.offsetHeight),
					left: _elm_lang$core$Maybe$Just(geometry.menu.offsetLeft),
					bottom: _elm_lang$core$Maybe$Nothing,
					right: _elm_lang$core$Maybe$Nothing
				};
			case 'BottomRight':
				return {
					top: _elm_lang$core$Maybe$Just(geometry.button.offsetTop + geometry.button.offsetHeight),
					left: _elm_lang$core$Maybe$Nothing,
					bottom: _elm_lang$core$Maybe$Nothing,
					right: function () {
						var right = function (e) {
							return e.bounds.left + e.bounds.width;
						};
						return _elm_lang$core$Maybe$Just(
							right(geometry.container) - right(geometry.menu));
					}()
				};
			case 'TopLeft':
				return {
					top: _elm_lang$core$Maybe$Nothing,
					left: _elm_lang$core$Maybe$Just(geometry.menu.offsetLeft),
					bottom: function () {
						var bottom = geometry.container.bounds.top + geometry.container.bounds.height;
						return _elm_lang$core$Maybe$Just(bottom - geometry.button.bounds.top);
					}(),
					right: _elm_lang$core$Maybe$Nothing
				};
			case 'TopRight':
				return {
					top: _elm_lang$core$Maybe$Nothing,
					left: _elm_lang$core$Maybe$Nothing,
					bottom: function () {
						var bottom = geometry.container.bounds.top + geometry.container.bounds.height;
						return _elm_lang$core$Maybe$Just(bottom - geometry.button.bounds.top);
					}(),
					right: function () {
						var right = function (e) {
							return e.bounds.left + e.bounds.width;
						};
						return _elm_lang$core$Maybe$Just(
							right(geometry.container) - right(geometry.menu));
					}()
				};
			case 'Over':
				return {
					top: _elm_lang$core$Maybe$Just(0),
					left: _elm_lang$core$Maybe$Just(geometry.button.bounds.width - geometry.menu.bounds.width),
					bottom: _elm_lang$core$Maybe$Nothing,
					right: _elm_lang$core$Maybe$Nothing
				};
			default:
				return {
					top: _elm_lang$core$Maybe$Just(geometry.button.bounds.height + 20),
					left: _elm_lang$core$Maybe$Just(0),
					bottom: _elm_lang$core$Maybe$Nothing,
					right: _elm_lang$core$Maybe$Just(0)
				};
		}
	});
var _debois$elm_mdl$Material_Dropdown$index = function (v) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					index: _elm_lang$core$Maybe$Just(v)
				});
		});
};
var _debois$elm_mdl$Material_Dropdown$defaultModel = {ripples: _elm_lang$core$Dict$empty, open: false, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing};
var _debois$elm_mdl$Material_Dropdown$_p2 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_debois$elm_mdl$Material_Dropdown$defaultModel);
var _debois$elm_mdl$Material_Dropdown$get = _debois$elm_mdl$Material_Dropdown$_p2._0;
var _debois$elm_mdl$Material_Dropdown$set = _debois$elm_mdl$Material_Dropdown$_p2._1;
var _debois$elm_mdl$Material_Dropdown$item = _debois$elm_mdl$Material_Dropdown_Item$item;
var _debois$elm_mdl$Material_Dropdown$constant = {transitionDurationSeconds: 0.3, transitionDurationFraction: 0.8, closeTimeout: 150};
var _debois$elm_mdl$Material_Dropdown$transitionDuration = _debois$elm_mdl$Material_Dropdown$constant.transitionDurationSeconds * _debois$elm_mdl$Material_Dropdown$constant.transitionDurationFraction;
var _debois$elm_mdl$Material_Dropdown$Model = F4(
	function (a, b, c, d) {
		return {ripples: a, open: b, geometry: c, index: d};
	});
var _debois$elm_mdl$Material_Dropdown$Config = F3(
	function (a, b, c) {
		return {alignment: a, index: b, listeners: c};
	});
var _debois$elm_mdl$Material_Dropdown$Key = F4(
	function (a, b, c, d) {
		return {ctor: 'Key', _0: a, _1: b, _2: c, _3: d};
	});
var _debois$elm_mdl$Material_Dropdown$Click = F2(
	function (a, b) {
		return {ctor: 'Click', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Dropdown$Close = {ctor: 'Close'};
var _debois$elm_mdl$Material_Dropdown$ItemMsg = F2(
	function (a, b) {
		return {ctor: 'ItemMsg', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Dropdown$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _debois$elm_mdl$Material_Dropdown$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p3 = msg;
			switch (_p3.ctor) {
				case 'Open':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								open: true,
								geometry: _elm_lang$core$Maybe$Just(_p3._0),
								index: _elm_lang$core$Maybe$Nothing
							}),
						{ctor: '[]'});
				case 'Close':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{open: false, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing}),
						{ctor: '[]'});
				case 'ItemMsg':
					if (_p3._1.ctor === 'Select') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									index: _elm_lang$core$Maybe$Just(_p3._0)
								}),
							A2(
								_elm_lang$core$List$filterMap,
								_elm_lang$core$Basics$identity,
								{
									ctor: '::',
									_0: _elm_lang$core$Maybe$Just(
										A2(
											_debois$elm_mdl$Material_Helpers$delay,
											150,
											fwd(_debois$elm_mdl$Material_Dropdown$Close))),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Maybe$map, _debois$elm_mdl$Material_Helpers$cmd, _p3._1._0),
										_1: {ctor: '[]'}
									}
								}));
					} else {
						var _p6 = _p3._0;
						var _p4 = A2(
							_debois$elm_mdl$Material_Ripple$update,
							_p3._1._0,
							A2(
								_elm_lang$core$Maybe$withDefault,
								_debois$elm_mdl$Material_Ripple$model,
								A2(_elm_lang$core$Dict$get, _p6, model.ripples)));
						var model_ = _p4._0;
						var cmd = _p4._1;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									ripples: A3(_elm_lang$core$Dict$insert, _p6, model_, model.ripples)
								}),
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Platform_Cmd$map,
									function (_p5) {
										return fwd(
											A2(
												_debois$elm_mdl$Material_Dropdown$ItemMsg,
												_p6,
												_debois$elm_mdl$Material_Dropdown_Item$Ripple(_p5)));
									},
									cmd),
								_1: {ctor: '[]'}
							});
					}
				case 'Click':
					var g = A2(_elm_lang$core$Maybe$withDefault, _debois$elm_mdl$Material_Dropdown_Geometry$defaultGeometry, model.geometry);
					var container = g.container.bounds;
					var input = g.button.bounds;
					var inside = F2(
						function (_p8, _p7) {
							var _p9 = _p8;
							var _p14 = _p9.y;
							var _p13 = _p9.x;
							var _p10 = _p7;
							var _p12 = _p10.top;
							var _p11 = _p10.left;
							return (_elm_lang$core$Native_Utils.cmp(
								_p11,
								_elm_lang$core$Basics$toFloat(_p13)) < 1) && ((_elm_lang$core$Native_Utils.cmp(
								_elm_lang$core$Basics$toFloat(_p13),
								_p11 + _p10.width) < 1) && ((_elm_lang$core$Native_Utils.cmp(
								_p12,
								_elm_lang$core$Basics$toFloat(_p14)) < 1) && (_elm_lang$core$Native_Utils.cmp(
								_elm_lang$core$Basics$toFloat(_p14),
								_p12 + _p10.height) < 1)));
						});
					if (model.open && (!A2(inside, _p3._1, container))) {
						var _v4 = fwd,
							_v5 = _debois$elm_mdl$Material_Dropdown$Close,
							_v6 = model;
						fwd = _v4;
						msg = _v5;
						model = _v6;
						continue update;
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				default:
					var _p25 = _p3._1;
					var _p24 = _p3._3;
					var _p23 = _p3._0;
					var _p15 = _p3._2;
					switch (_p15) {
						case 9:
							var _v8 = fwd,
								_v9 = _debois$elm_mdl$Material_Dropdown$Close,
								_v10 = model;
							fwd = _v8;
							msg = _v9;
							model = _v10;
							continue update;
						case 13:
							if (model.open) {
								var _p16 = _p23;
								if (_p16.ctor === 'Just') {
									var _p18 = _p16._0;
									var cmd = A2(
										_elm_lang$core$Maybe$andThen,
										function (_p17) {
											return function (_) {
												return _.onSelect;
											}(
												function (_) {
													return _.config;
												}(_p17));
										},
										_elm_lang$core$List$head(
											A2(_elm_lang$core$List$drop, _p18, _p25)));
									var _v12 = fwd,
										_v13 = A2(
										_debois$elm_mdl$Material_Dropdown$ItemMsg,
										_p18,
										_debois$elm_mdl$Material_Dropdown_Item$Select(cmd)),
										_v14 = model;
									fwd = _v12;
									msg = _v13;
									model = _v14;
									continue update;
								} else {
									var _v15 = fwd,
										_v16 = _debois$elm_mdl$Material_Dropdown$Close,
										_v17 = model;
									fwd = _v15;
									msg = _v16;
									model = _v17;
									continue update;
								}
							} else {
								var _v18 = fwd,
									_v19 = _debois$elm_mdl$Material_Dropdown$Open(_p24),
									_v20 = model;
								fwd = _v18;
								msg = _v19;
								model = _v20;
								continue update;
							}
						case 27:
							var _v21 = fwd,
								_v22 = _debois$elm_mdl$Material_Dropdown$Close,
								_v23 = model;
							fwd = _v21;
							msg = _v22;
							model = _v23;
							continue update;
						case 32:
							var _v24 = fwd,
								_v25 = A4(_debois$elm_mdl$Material_Dropdown$Key, _p23, _p25, 13, _p24),
								_v26 = model;
							fwd = _v24;
							msg = _v25;
							model = _v26;
							continue update;
						case 40:
							var numItems = _elm_lang$core$List$length(_p25);
							var items = A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								_p25);
							var index = A2(_elm_lang$core$Maybe$withDefault, -1, _p23);
							return A3(
								_elm_lang$core$Basics$flip,
								F2(
									function (x, y) {
										return A2(_elm_lang$core$Platform_Cmd_ops['!'], x, y);
									}),
								{ctor: '[]'},
								A2(
									_elm_lang$core$Maybe$withDefault,
									model,
									A2(
										_elm_lang$core$Maybe$map,
										function (_p19) {
											return function (index_) {
												return _elm_lang$core$Native_Utils.update(
													model,
													{
														index: _elm_lang$core$Maybe$Just(index_)
													});
											}(
												_elm_lang$core$Tuple$first(_p19));
										},
										_elm_lang$core$List$head(
											A2(
												_elm_lang$core$List$filter,
												function (_p20) {
													return function (_) {
														return _.enabled;
													}(
														function (_) {
															return _.config;
														}(
															_elm_lang$core$Tuple$second(_p20)));
												},
												A2(
													_elm_lang$core$List$drop,
													1 + index,
													A2(_elm_lang$core$Basics_ops['++'], items, items)))))));
						case 38:
							var numItems = _elm_lang$core$List$length(_p25);
							var items = A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								_p25);
							var index = A2(_elm_lang$core$Maybe$withDefault, 0, _p23);
							return _debois$elm_mdl$Material_Helpers$pure(
								A2(
									_elm_lang$core$Maybe$withDefault,
									model,
									A2(
										_elm_lang$core$Maybe$map,
										function (_p21) {
											return function (index_) {
												return _elm_lang$core$Native_Utils.update(
													model,
													{
														index: _elm_lang$core$Maybe$Just(index_)
													});
											}(
												_elm_lang$core$Tuple$first(_p21));
										},
										_elm_lang$core$List$head(
											A2(
												_elm_lang$core$List$filter,
												function (_p22) {
													return function (_) {
														return _.enabled;
													}(
														function (_) {
															return _.config;
														}(
															_elm_lang$core$Tuple$second(_p22)));
												},
												A2(
													_elm_lang$core$List$drop,
													numItems - index,
													_elm_lang$core$List$reverse(
														A2(_elm_lang$core$Basics_ops['++'], items, items))))))));
						default:
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{ctor: '[]'});
					}
			}
		}
	});
var _debois$elm_mdl$Material_Dropdown$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			function (_p26) {
				return _elm_lang$core$Maybe$Just(
					A3(_debois$elm_mdl$Material_Dropdown$set, idx, store, _p26));
			},
			A3(
				_debois$elm_mdl$Material_Dropdown$update,
				lift,
				msg,
				A2(_debois$elm_mdl$Material_Dropdown$get, idx, store)));
	});
var _debois$elm_mdl$Material_Dropdown$Below = {ctor: 'Below'};
var _debois$elm_mdl$Material_Dropdown$below = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$Below});
	});
var _debois$elm_mdl$Material_Dropdown$applyContainerGeometry = F2(
	function (alignment, g) {
		var r = A2(_debois$elm_mdl$Material_Dropdown$containerGeometry, alignment, g);
		var f = function (v) {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				'auto',
				A2(_elm_lang$core$Maybe$map, _debois$elm_mdl$Material_Dropdown$toPx, v));
		};
		return _debois$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$css,
					'top',
					f(r.top)),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$css,
						'bottom',
						f(r.bottom)),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$css,
							'left',
							f(r.left)),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$css,
								'right',
								f(r.right)),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$css,
									'width',
									_elm_lang$core$Native_Utils.eq(alignment, _debois$elm_mdl$Material_Dropdown$Below) ? '100%' : _debois$elm_mdl$Material_Dropdown$toPx(g.menu.bounds.width)),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$css,
										'height',
										_debois$elm_mdl$Material_Dropdown$toPx(g.menu.bounds.height)),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
	});
var _debois$elm_mdl$Material_Dropdown$clip = F3(
	function (model, alignment, g) {
		var height = g.menu.bounds.height;
		var width = g.menu.bounds.width;
		return A2(
			_debois$elm_mdl$Material_Options$css,
			'clip',
			function () {
				if (model.open) {
					return _elm_lang$core$Native_Utils.eq(alignment, _debois$elm_mdl$Material_Dropdown$Below) ? A4(_debois$elm_mdl$Material_Dropdown$rect, 0, g.button.bounds.width, height, 0) : A4(_debois$elm_mdl$Material_Dropdown$rect, 0, width, height, 0);
				} else {
					var _p27 = alignment;
					switch (_p27.ctor) {
						case 'BottomRight':
							return A4(_debois$elm_mdl$Material_Dropdown$rect, 0, width, 0, width);
						case 'TopLeft':
							return A4(_debois$elm_mdl$Material_Dropdown$rect, height, 0, height, 0);
						case 'TopRight':
							return A4(_debois$elm_mdl$Material_Dropdown$rect, height, width, height, width);
						default:
							return '';
					}
				}
			}());
	});
var _debois$elm_mdl$Material_Dropdown$Over = {ctor: 'Over'};
var _debois$elm_mdl$Material_Dropdown$over = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$Over});
	});
var _debois$elm_mdl$Material_Dropdown$TopRight = {ctor: 'TopRight'};
var _debois$elm_mdl$Material_Dropdown$topRight = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$TopRight});
	});
var _debois$elm_mdl$Material_Dropdown$TopLeft = {ctor: 'TopLeft'};
var _debois$elm_mdl$Material_Dropdown$topLeft = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$TopLeft});
	});
var _debois$elm_mdl$Material_Dropdown$transitionDelay = F4(
	function (alignment, height, offsetTop, offsetHeight) {
		var t = (_elm_lang$core$Native_Utils.eq(alignment, _debois$elm_mdl$Material_Dropdown$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _debois$elm_mdl$Material_Dropdown$TopRight)) ? ((((height - offsetTop) - offsetHeight) / height) * _debois$elm_mdl$Material_Dropdown$transitionDuration) : ((offsetTop / height) * _debois$elm_mdl$Material_Dropdown$transitionDuration);
		return A2(
			_debois$elm_mdl$Material_Options$css,
			'transition-delay',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(t),
				's'));
	});
var _debois$elm_mdl$Material_Dropdown$BottomRight = {ctor: 'BottomRight'};
var _debois$elm_mdl$Material_Dropdown$bottomRight = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$BottomRight});
	});
var _debois$elm_mdl$Material_Dropdown$BottomLeft = {ctor: 'BottomLeft'};
var _debois$elm_mdl$Material_Dropdown$defaultConfig = {
	alignment: _debois$elm_mdl$Material_Dropdown$BottomLeft,
	index: _elm_lang$core$Maybe$Nothing,
	listeners: {ctor: '[]'}
};
var _debois$elm_mdl$Material_Dropdown$view = F4(
	function (lift, model, properties, items) {
		var itemSummaries = A2(
			_elm_lang$core$List$map,
			function (_p28) {
				return A2(
					_debois$elm_mdl$Material_Options_Internal$collect,
					_debois$elm_mdl$Material_Dropdown_Item$defaultConfig,
					function (_) {
						return _.options;
					}(_p28));
			},
			items);
		var numItems = _elm_lang$core$List$length(items);
		var fwdRipple = function (_p29) {
			return lift(
				A2(
					_debois$elm_mdl$Material_Dropdown$ItemMsg,
					-1,
					_debois$elm_mdl$Material_Dropdown_Item$Ripple(_p29)));
		};
		var g = A2(_elm_lang$core$Maybe$withDefault, _debois$elm_mdl$Material_Dropdown_Geometry$defaultGeometry, model.geometry);
		var menu = g.menu.bounds;
		var _p30 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Dropdown$defaultConfig, properties);
		var summary = _p30;
		var config = _p30.config;
		var container = A2(_debois$elm_mdl$Material_Dropdown$containerGeometry, config.alignment, g);
		var defaultIndex_ = A2(_debois$elm_mdl$Material_Dropdown$defaultIndex, model, config.index);
		var alignment = function () {
			var _p31 = config.alignment;
			switch (_p31.ctor) {
				case 'BottomLeft':
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--bottom-left');
				case 'BottomRight':
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--bottom-right');
				case 'TopLeft':
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--top-left');
				case 'TopRight':
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--top-right');
				case 'Over':
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--over');
				default:
					return _debois$elm_mdl$Material_Options$cs('mdl-menu--below');
			}
		}();
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-menu__container'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('is-upgraded'),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							model.open,
							_debois$elm_mdl$Material_Options$cs('is-visible')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								model.open,
								A2(_debois$elm_mdl$Material_Dropdown$applyContainerGeometry, config.alignment, g)),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A3(
					_debois$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-menu__outline'),
						_1: {
							ctor: '::',
							_0: alignment,
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									model.open && (!_elm_lang$core$Native_Utils.eq(config.alignment, _debois$elm_mdl$Material_Dropdown$Below)),
									A2(
										_debois$elm_mdl$Material_Options$css,
										'width',
										_debois$elm_mdl$Material_Dropdown$toPx(menu.width))),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										model.open,
										A2(
											_debois$elm_mdl$Material_Options$css,
											'height',
											_debois$elm_mdl$Material_Dropdown$toPx(menu.height))),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_debois$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html_Keyed$ul,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-menu'),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$cs('mdl-js-menu'),
								_1: {
									ctor: '::',
									_0: A3(_debois$elm_mdl$Material_Dropdown$clip, model, config.alignment, g),
									_1: {
										ctor: '::',
										_0: alignment,
										_1: {ctor: '[]'}
									}
								}
							}
						},
						function () {
							var transitionDelays = A3(
								_elm_lang$core$List$map2,
								F2(
									function (offsetTop, offsetHeight) {
										return A4(_debois$elm_mdl$Material_Dropdown$transitionDelay, config.alignment, g.menu.bounds.height, offsetTop, offsetHeight);
									}),
								g.offsetTops,
								g.offsetHeights);
							var view1 = F3(
								function (index, item, options) {
									return A5(
										_debois$elm_mdl$Material_Dropdown_Item$view,
										function (_p32) {
											return lift(
												A2(_debois$elm_mdl$Material_Dropdown$ItemMsg, index, _p32));
										},
										model,
										index,
										item,
										{
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												_elm_lang$core$Native_Utils.eq(
													_elm_lang$core$Maybe$Just(index),
													defaultIndex_),
												_debois$elm_mdl$Material_Dropdown_Item$selected),
											_1: options
										});
								});
							return model.open ? A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (index, _p33) {
										var _p34 = _p33;
										return A3(
											view1,
											index,
											_p34._0,
											{
												ctor: '::',
												_0: _p34._1,
												_1: {ctor: '[]'}
											});
									}),
								A3(
									_elm_lang$core$List$map2,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									items,
									transitionDelays)) : A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (index, item) {
										return A3(
											view1,
											index,
											item,
											{ctor: '[]'});
									}),
								items);
						}()),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_mdl$Material_Dropdown$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Dropdown$get, _debois$elm_mdl$Material_Dropdown$view, _debois$elm_mdl$Material_Component$MenuMsg);
var _debois$elm_mdl$Material_Dropdown$bottomLeft = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _debois$elm_mdl$Material_Dropdown$BottomLeft});
	});

var _debois$elm_mdl$Material_Menu$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _debois$elm_mdl$Material_Menu$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_debois$elm_mdl$Material_Menu$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _debois$elm_mdl$Material_Menu$decodeGeometry = A6(
	_elm_lang$core$Json_Decode$map5,
	_debois$elm_mdl$Material_Dropdown_Geometry$Geometry,
	_debois$elm_dom$DOM$target(_debois$elm_mdl$Material_Dropdown_Geometry$element),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$nextSibling(
			A2(_debois$elm_dom$DOM$childNode, 1, _debois$elm_mdl$Material_Dropdown_Geometry$element))),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$nextSibling(_debois$elm_mdl$Material_Dropdown_Geometry$element)),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$nextSibling(
			A2(
				_debois$elm_dom$DOM$childNode,
				1,
				_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetTop)))),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$nextSibling(
			A2(
				_debois$elm_dom$DOM$childNode,
				1,
				_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetHeight)))));
var _debois$elm_mdl$Material_Menu$icon = function (_p1) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (name, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{icon: name});
			})(_p1));
};
var _debois$elm_mdl$Material_Menu$dropdownOption = function (option) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					dropdown: {ctor: '::', _0: option, _1: config.dropdown}
				});
		});
};
var _debois$elm_mdl$Material_Menu$bottomLeft = _debois$elm_mdl$Material_Menu$dropdownOption(_debois$elm_mdl$Material_Dropdown$bottomLeft);
var _debois$elm_mdl$Material_Menu$bottomRight = _debois$elm_mdl$Material_Menu$dropdownOption(_debois$elm_mdl$Material_Dropdown$bottomRight);
var _debois$elm_mdl$Material_Menu$topLeft = _debois$elm_mdl$Material_Menu$dropdownOption(_debois$elm_mdl$Material_Dropdown$topLeft);
var _debois$elm_mdl$Material_Menu$topRight = _debois$elm_mdl$Material_Menu$dropdownOption(_debois$elm_mdl$Material_Dropdown$topRight);
var _debois$elm_mdl$Material_Menu$index = function (_p2) {
	return _debois$elm_mdl$Material_Menu$dropdownOption(
		_debois$elm_mdl$Material_Dropdown$index(_p2));
};
var _debois$elm_mdl$Material_Menu$defaultConfig = {
	dropdown: {ctor: '[]'},
	icon: 'more_vert'
};
var _debois$elm_mdl$Material_Menu$defaultModel = {dropdown: _debois$elm_mdl$Material_Dropdown$defaultModel, ignoreClick: _elm_lang$core$Maybe$Nothing};
var _debois$elm_mdl$Material_Menu$_p3 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_debois$elm_mdl$Material_Menu$defaultModel);
var _debois$elm_mdl$Material_Menu$get = _debois$elm_mdl$Material_Menu$_p3._0;
var _debois$elm_mdl$Material_Menu$set = _debois$elm_mdl$Material_Menu$_p3._1;
var _debois$elm_mdl$Material_Menu$item = _debois$elm_mdl$Material_Dropdown_Item$item;
var _debois$elm_mdl$Material_Menu$constant = {transitionDurationSeconds: 0.3, transitionDurationFraction: 0.8, closeTimeout: 150};
var _debois$elm_mdl$Material_Menu$transitionDuration = _debois$elm_mdl$Material_Menu$constant.transitionDurationSeconds * _debois$elm_mdl$Material_Menu$constant.transitionDurationFraction;
var _debois$elm_mdl$Material_Menu$Model = F2(
	function (a, b) {
		return {dropdown: a, ignoreClick: b};
	});
var _debois$elm_mdl$Material_Menu$Config = F2(
	function (a, b) {
		return {dropdown: a, icon: b};
	});
var _debois$elm_mdl$Material_Menu$MenuMsg = function (a) {
	return {ctor: 'MenuMsg', _0: a};
};
var _debois$elm_mdl$Material_Menu$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p4 = msg;
			switch (_p4.ctor) {
				case 'Click':
					var _p5 = model.ignoreClick;
					if (_p5.ctor === 'Just') {
						if (_p5._0 === 2) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{
										ignoreClick: _elm_lang$core$Maybe$Just(1)
									}),
								{ctor: '[]'});
						} else {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{ignoreClick: _elm_lang$core$Maybe$Nothing}),
								{ctor: '[]'});
						}
					} else {
						var _v2 = fwd,
							_v3 = _debois$elm_mdl$Material_Menu$MenuMsg(
							A2(_debois$elm_mdl$Material_Dropdown$Click, _p4._0, _p4._1)),
							_v4 = model;
						fwd = _v2;
						msg = _v3;
						model = _v4;
						continue update;
					}
				case 'Open':
					var _p6 = model.ignoreClick;
					if (_p6.ctor === 'Just') {
						if (_p6._0 === 2) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{
										ignoreClick: _elm_lang$core$Maybe$Just(1)
									}),
								{ctor: '[]'});
						} else {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{ignoreClick: _elm_lang$core$Maybe$Nothing}),
								{ctor: '[]'});
						}
					} else {
						var _v6 = fwd,
							_v7 = _debois$elm_mdl$Material_Menu$MenuMsg(
							_debois$elm_mdl$Material_Dropdown$Open(_p4._0)),
							_v8 = model;
						fwd = _v6;
						msg = _v7;
						model = _v8;
						continue update;
					}
				case 'Close':
					var _p7 = model.ignoreClick;
					if (_p7.ctor === 'Just') {
						if (_p7._0 === 2) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{
										ignoreClick: _elm_lang$core$Maybe$Just(1)
									}),
								{ctor: '[]'});
						} else {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{ignoreClick: _elm_lang$core$Maybe$Nothing}),
								{ctor: '[]'});
						}
					} else {
						var _v10 = fwd,
							_v11 = _debois$elm_mdl$Material_Menu$MenuMsg(_debois$elm_mdl$Material_Dropdown$Close),
							_v12 = model;
						fwd = _v10;
						msg = _v11;
						model = _v12;
						continue update;
					}
				case 'Key':
					var _p12 = _p4._2;
					return (_elm_lang$core$Native_Utils.eq(_p12, 32) ? ((!model.dropdown.open) ? function (_p8) {
						var _p9 = _p8;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p9._0,
								{
									ignoreClick: _elm_lang$core$Maybe$Just(2)
								}),
							{
								ctor: '::',
								_0: _p9._1,
								_1: {ctor: '[]'}
							});
					} : function (_p10) {
						var _p11 = _p10;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p11._0,
								{
									ignoreClick: _elm_lang$core$Maybe$Just(1)
								}),
							{
								ctor: '::',
								_0: _p11._1,
								_1: {ctor: '[]'}
							});
					}) : _elm_lang$core$Basics$identity)(
						A3(
							_debois$elm_mdl$Material_Menu$update,
							fwd,
							_debois$elm_mdl$Material_Menu$MenuMsg(
								A4(_debois$elm_mdl$Material_Dropdown$Key, _p4._0, _p4._1, _p12, _p4._3)),
							model));
				default:
					var _p13 = A3(
						_debois$elm_mdl$Material_Dropdown$update,
						function (_p14) {
							return fwd(
								_debois$elm_mdl$Material_Menu$MenuMsg(_p14));
						},
						_p4._0,
						model.dropdown);
					var dropdown = _p13._0;
					var cmds = _p13._1;
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{dropdown: dropdown}),
						{
							ctor: '::',
							_0: cmds,
							_1: {ctor: '[]'}
						});
			}
		}
	});
var _debois$elm_mdl$Material_Menu$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			function (_p15) {
				return _elm_lang$core$Maybe$Just(
					A3(_debois$elm_mdl$Material_Menu$set, idx, store, _p15));
			},
			A3(
				_debois$elm_mdl$Material_Menu$update,
				lift,
				msg,
				A2(_debois$elm_mdl$Material_Menu$get, idx, store)));
	});
var _debois$elm_mdl$Material_Menu$Click = F2(
	function (a, b) {
		return {ctor: 'Click', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Menu$subscriptions = function (model) {
	return model.dropdown.open ? _elm_lang$mouse$Mouse$clicks(
		_debois$elm_mdl$Material_Menu$Click(_debois$elm_mdl$Material_Dropdown$TopLeft)) : _elm_lang$core$Platform_Sub$none;
};
var _debois$elm_mdl$Material_Menu$subs = A3(
	_debois$elm_mdl$Material_Component$subs,
	_debois$elm_mdl$Material_Component$MenuMsg,
	function (_) {
		return _.menu;
	},
	_debois$elm_mdl$Material_Menu$subscriptions);
var _debois$elm_mdl$Material_Menu$Key = F4(
	function (a, b, c, d) {
		return {ctor: 'Key', _0: a, _1: b, _2: c, _3: d};
	});
var _debois$elm_mdl$Material_Menu$Close = {ctor: 'Close'};
var _debois$elm_mdl$Material_Menu$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _debois$elm_mdl$Material_Menu$view = F4(
	function (lift, model, properties, items) {
		var itemSummaries = A2(
			_elm_lang$core$List$map,
			function (_p16) {
				return A2(
					_debois$elm_mdl$Material_Options_Internal$collect,
					_debois$elm_mdl$Material_Dropdown_Item$defaultConfig,
					function (_) {
						return _.options;
					}(_p16));
			},
			items);
		var _p17 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Menu$defaultConfig, properties);
		var summary = _p17;
		var config = _p17.config;
		var dropdownSummary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Dropdown$defaultConfig, config.dropdown);
		var dropdownConfig = dropdownSummary.config;
		var defaultIndex = (!_elm_lang$core$Native_Utils.eq(model.dropdown.index, _elm_lang$core$Maybe$Nothing)) ? model.dropdown.index : dropdownConfig.index;
		var button = A4(
			_debois$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-button'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-js-button'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-button--icon'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$on,
								'click',
								A2(
									_elm_lang$core$Json_Decode$map,
									lift,
									A2(
										_elm_lang$core$Json_Decode$map,
										model.dropdown.open ? _elm_lang$core$Basics$always(_debois$elm_mdl$Material_Menu$Close) : _debois$elm_mdl$Material_Menu$Open,
										_debois$elm_mdl$Material_Menu$decodeGeometry))),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$on,
									'keydown',
									A2(
										_elm_lang$core$Json_Decode$map,
										lift,
										A3(
											_elm_lang$core$Json_Decode$map2,
											A2(_debois$elm_mdl$Material_Menu$Key, defaultIndex, itemSummaries),
											_elm_lang$html$Html_Events$keyCode,
											_debois$elm_mdl$Material_Menu$decodeGeometry))),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'onkeydown', 'javascript:\n                  if ((event.keyCode == 38) || (event.keyCode == 40)) {\n                      event.preventDefault();\n                  }\n                  if (event.keyCode == 32) {\n                      //return false;\n                  }\n              '),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Icon$view,
					'more_vert',
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('material-icons'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'pointer-events', 'none'),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'position', 'relative'),
				_1: properties
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: button,
				_1: {
					ctor: '::',
					_0: A4(
						_debois$elm_mdl$Material_Dropdown$view,
						function (_p18) {
							return lift(
								_debois$elm_mdl$Material_Menu$MenuMsg(_p18));
						},
						model.dropdown,
						config.dropdown,
						items),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_mdl$Material_Menu$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Menu$get, _debois$elm_mdl$Material_Menu$view, _debois$elm_mdl$Material_Component$MenuMsg);

var _debois$elm_mdl$Material_Snackbar$enqueue = F2(
	function (contents, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				queue: A2(
					_elm_lang$core$List$append,
					model.queue,
					{
						ctor: '::',
						_0: contents,
						_1: {ctor: '[]'}
					})
			});
	});
var _debois$elm_mdl$Material_Snackbar$snackbar = F3(
	function (payload, message, label) {
		return {
			message: message,
			action: _elm_lang$core$Maybe$Just(label),
			payload: payload,
			timeout: 2750,
			fade: 250
		};
	});
var _debois$elm_mdl$Material_Snackbar$toast = F2(
	function (payload, message) {
		return {message: message, action: _elm_lang$core$Maybe$Nothing, payload: payload, timeout: 2750, fade: 250};
	});
var _debois$elm_mdl$Material_Snackbar$Contents = F5(
	function (a, b, c, d, e) {
		return {message: a, action: b, payload: c, timeout: d, fade: e};
	});
var _debois$elm_mdl$Material_Snackbar$Model = F3(
	function (a, b, c) {
		return {queue: a, state: b, seq: c};
	});
var _debois$elm_mdl$Material_Snackbar$Fading = function (a) {
	return {ctor: 'Fading', _0: a};
};
var _debois$elm_mdl$Material_Snackbar$Active = function (a) {
	return {ctor: 'Active', _0: a};
};
var _debois$elm_mdl$Material_Snackbar$Inert = {ctor: 'Inert'};
var _debois$elm_mdl$Material_Snackbar$model = {
	queue: {ctor: '[]'},
	state: _debois$elm_mdl$Material_Snackbar$Inert,
	seq: -1
};
var _debois$elm_mdl$Material_Snackbar$Clicked = {ctor: 'Clicked'};
var _debois$elm_mdl$Material_Snackbar$Timeout = {ctor: 'Timeout'};
var _debois$elm_mdl$Material_Snackbar$Move = F2(
	function (a, b) {
		return {ctor: 'Move', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Snackbar$next = function (model) {
	return _elm_lang$core$Platform_Cmd$map(
		_debois$elm_mdl$Material_Snackbar$Move(model.seq));
};
var _debois$elm_mdl$Material_Snackbar$view = function (model) {
	var isActive = function () {
		var _p0 = model.state;
		switch (_p0.ctor) {
			case 'Inert':
				return false;
			case 'Active':
				return true;
			default:
				return false;
		}
	}();
	var contents = function () {
		var _p1 = model.state;
		switch (_p1.ctor) {
			case 'Inert':
				return _elm_lang$core$Maybe$Nothing;
			case 'Active':
				return _elm_lang$core$Maybe$Just(_p1._0);
			default:
				return _elm_lang$core$Maybe$Just(_p1._0);
		}
	}();
	var action = A2(
		_elm_lang$core$Maybe$andThen,
		function (_) {
			return _.action;
		},
		contents);
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'mdl-js-snackbar', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-snackbar', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'mdl-snackbar--active', _1: isActive},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Helpers$aria, 'hidden', !isActive),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__text'),
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					A2(
						_elm_lang$core$Maybe$map,
						function (c) {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html$text(c.message),
								_1: {ctor: '[]'}
							};
						},
						contents))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__action'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('button'),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Helpers$aria,
									'hidden',
									A2(
										_elm_lang$core$Maybe$withDefault,
										true,
										A2(
											_elm_lang$core$Maybe$map,
											_elm_lang$core$Basics$always(!isActive),
											action))),
								_1: A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										_elm_lang$core$Basics$always(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													A2(_debois$elm_mdl$Material_Snackbar$Move, model.seq, _debois$elm_mdl$Material_Snackbar$Clicked)),
												_1: {ctor: '[]'}
											}),
										action))
							}
						}
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (action) {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(action),
									_1: {ctor: '[]'}
								};
							},
							action))),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_mdl$Material_Snackbar$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _debois$elm_mdl$Material_Snackbar$End = function (a) {
	return {ctor: 'End', _0: a};
};
var _debois$elm_mdl$Material_Snackbar$Begin = function (a) {
	return {ctor: 'Begin', _0: a};
};
var _debois$elm_mdl$Material_Snackbar$tryDequeue = function (model) {
	var _p2 = {ctor: '_Tuple2', _0: model.state, _1: model.queue};
	if (((_p2.ctor === '_Tuple2') && (_p2._0.ctor === 'Inert')) && (_p2._1.ctor === '::')) {
		var _p3 = _p2._1._0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					state: _debois$elm_mdl$Material_Snackbar$Active(_p3),
					queue: _p2._1._1,
					seq: model.seq + 1
				}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Platform_Cmd$map,
						_debois$elm_mdl$Material_Snackbar$Move(model.seq + 1),
						A2(_debois$elm_mdl$Material_Helpers$delay, _p3.timeout, _debois$elm_mdl$Material_Snackbar$Timeout)),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Helpers$cmd(
							_debois$elm_mdl$Material_Snackbar$Begin(_p3.payload)),
						_1: {ctor: '[]'}
					}
				})
		};
	} else {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _debois$elm_mdl$Material_Snackbar$move = F2(
	function (transition, model) {
		var _p4 = {ctor: '_Tuple2', _0: model.state, _1: transition};
		_v3_4:
		do {
			if (_p4.ctor === '_Tuple2') {
				if (_p4._1.ctor === 'Clicked') {
					if (_p4._0.ctor === 'Active') {
						var _p5 = _p4._0._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									state: _debois$elm_mdl$Material_Snackbar$Fading(_p5)
								}),
							_1: _elm_lang$core$Platform_Cmd$batch(
								{
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Snackbar$next,
										model,
										A2(_debois$elm_mdl$Material_Helpers$delay, _p5.fade, _debois$elm_mdl$Material_Snackbar$Timeout)),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Helpers$cmd(
											_debois$elm_mdl$Material_Snackbar$Click(_p5.payload)),
										_1: {ctor: '[]'}
									}
								})
						};
					} else {
						break _v3_4;
					}
				} else {
					switch (_p4._0.ctor) {
						case 'Inert':
							return _debois$elm_mdl$Material_Snackbar$tryDequeue(model);
						case 'Active':
							var _p6 = _p4._0._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{
										state: _debois$elm_mdl$Material_Snackbar$Fading(_p6)
									}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Snackbar$next,
											model,
											A2(_debois$elm_mdl$Material_Helpers$delay, _p6.fade, _debois$elm_mdl$Material_Snackbar$Timeout)),
										_1: {ctor: '[]'}
									})
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{state: _debois$elm_mdl$Material_Snackbar$Inert}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Snackbar$next,
											model,
											_debois$elm_mdl$Material_Helpers$cmd(_debois$elm_mdl$Material_Snackbar$Timeout)),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Helpers$cmd(
												_debois$elm_mdl$Material_Snackbar$End(_p4._0._0.payload)),
											_1: {ctor: '[]'}
										}
									})
							};
					}
				}
			} else {
				break _v3_4;
			}
		} while(false);
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _debois$elm_mdl$Material_Snackbar$update = F2(
	function (action, model) {
		var _p7 = action;
		if (_p7.ctor === 'Move') {
			return _elm_lang$core$Native_Utils.eq(_p7._0, model.seq) ? A2(_debois$elm_mdl$Material_Snackbar$move, _p7._1, model) : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _debois$elm_mdl$Material_Snackbar$add = F2(
	function (contents, model) {
		return _debois$elm_mdl$Material_Snackbar$tryDequeue(
			A2(_debois$elm_mdl$Material_Snackbar$enqueue, contents, model));
	});

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _debois$elm_mdl$Material_Layout$_p0 = {
	ctor: '_Tuple2',
	_0: function (_) {
		return _.layout;
	},
	_1: F2(
		function (x, s) {
			return _elm_lang$core$Native_Utils.update(
				s,
				{layout: x});
		})
};
var _debois$elm_mdl$Material_Layout$get = _debois$elm_mdl$Material_Layout$_p0._0;
var _debois$elm_mdl$Material_Layout$set = _debois$elm_mdl$Material_Layout$_p0._1;
var _debois$elm_mdl$Material_Layout$drawerView = F3(
	function (lift, isVisible, elems) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html_Attributes$attribute,
						'aria-hidden',
						isVisible ? 'false' : 'true'),
					_1: {ctor: '[]'}
				}
			},
			elems);
	});
var _debois$elm_mdl$Material_Layout$onKeypressFilterSpaceAndEnter = A2(_elm_lang$html$Html_Attributes$attribute, 'onkeypress', '\n  (function (evt) {\n     if (evt && evt.type === \"keydown\" && (evt.keyCode === 32 || evt.keyCode === 13)) {\n       evt.preventDefault();\n     }\n   })(window.event);\n  ');
var _debois$elm_mdl$Material_Layout$toList = function (x) {
	var _p1 = x;
	if (_p1.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return {
			ctor: '::',
			_0: _p1._0,
			_1: {ctor: '[]'}
		};
	}
};
var _debois$elm_mdl$Material_Layout$isWaterfall = function (mode) {
	var _p2 = mode;
	if (_p2.ctor === 'Waterfall') {
		return true;
	} else {
		return false;
	}
};
var _debois$elm_mdl$Material_Layout$row = function (styles) {
	return _debois$elm_mdl$Material_Options$div(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__header-row'),
			_1: styles
		});
};
var _debois$elm_mdl$Material_Layout$link = F2(
	function (styles, contents) {
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-navigation__link'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options_Internal$attribute(
						A2(_elm_lang$html$Html_Attributes$attribute, 'tabindex', '1')),
					_1: styles
				}
			},
			contents);
	});
var _debois$elm_mdl$Material_Layout$href = function (url) {
	return _debois$elm_mdl$Material_Options$attribute(
		_elm_lang$html$Html_Attributes$href(url));
};
var _debois$elm_mdl$Material_Layout$navigation = F2(
	function (styles, contents) {
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$nav,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-navigation'),
				_1: styles
			},
			contents);
	});
var _debois$elm_mdl$Material_Layout$title = function (styles) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__title'),
			_1: styles
		});
};
var _debois$elm_mdl$Material_Layout$spacer = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('mdl-layout-spacer'),
		_1: {ctor: '[]'}
	},
	{ctor: '[]'});
var _debois$elm_mdl$Material_Layout$onSelectTab = function (_p3) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (f, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onSelectTab: _elm_lang$core$Maybe$Just(
							function (_p4) {
								return _elm_lang$html$Html_Events$onClick(
									f(_p4));
							})
					});
			})(_p3));
};
var _debois$elm_mdl$Material_Layout$moreTabs = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{moreTabs: true});
	});
var _debois$elm_mdl$Material_Layout$selectedTab = function (_p5) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (k, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{selectedTab: k});
			})(_p5));
};
var _debois$elm_mdl$Material_Layout$transparentHeader = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{transparentHeader: true});
	});
var _debois$elm_mdl$Material_Layout$rippleTabs = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{rippleTabs: true});
	});
var _debois$elm_mdl$Material_Layout$fixedTabs = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedTabs: true});
	});
var _debois$elm_mdl$Material_Layout$fixedDrawer = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedDrawer: true});
	});
var _debois$elm_mdl$Material_Layout$fixedHeader = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedHeader: true});
	});
var _debois$elm_mdl$Material_Layout$mainId = 'elm-mdl-layout-main';
var _debois$elm_mdl$Material_Layout$setTabsWidth_ = F2(
	function (width, model) {
		var x = model.tabScrollState;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				tabScrollState: _elm_lang$core$Native_Utils.update(
					x,
					{
						width: _elm_lang$core$Maybe$Just(width)
					})
			});
	});
var _debois$elm_mdl$Material_Layout$setTabsWidth = F2(
	function (w, container) {
		return _elm_lang$core$Native_Utils.update(
			container,
			{
				layout: A2(_debois$elm_mdl$Material_Layout$setTabsWidth_, w, container.layout)
			});
	});
var _debois$elm_mdl$Material_Layout$defaultTabScrollState = {canScrollRight: true, canScrollLeft: false, width: _elm_lang$core$Maybe$Nothing};
var _debois$elm_mdl$Material_Layout$defaultModel = {ripples: _elm_lang$core$Dict$empty, isSmallScreen: false, isCompact: false, isAnimating: false, isScrolled: false, isDrawerOpen: false, tabScrollState: _debois$elm_mdl$Material_Layout$defaultTabScrollState};
var _debois$elm_mdl$Material_Layout$TabScrollState = F3(
	function (a, b, c) {
		return {canScrollLeft: a, canScrollRight: b, width: c};
	});
var _debois$elm_mdl$Material_Layout$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {ripples: a, isSmallScreen: b, isCompact: c, isAnimating: d, isScrolled: e, isDrawerOpen: f, tabScrollState: g};
	});
var _debois$elm_mdl$Material_Layout$Config = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {fixedHeader: a, fixedDrawer: b, fixedTabs: c, rippleTabs: d, mode: e, selectedTab: f, onSelectTab: g, transparentHeader: h, moreTabs: i};
	});
var _debois$elm_mdl$Material_Layout$Contents = F4(
	function (a, b, c, d) {
		return {header: a, drawer: b, tabs: c, main: d};
	});
var _debois$elm_mdl$Material_Layout$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Layout$NOP = {ctor: 'NOP'};
var _debois$elm_mdl$Material_Layout$TransitionEnd = {ctor: 'TransitionEnd'};
var _debois$elm_mdl$Material_Layout$TransitionHeader = function (a) {
	return {ctor: 'TransitionHeader', _0: a};
};
var _debois$elm_mdl$Material_Layout$update_ = F3(
	function (f, action, model) {
		update_:
		while (true) {
			var _p6 = action;
			switch (_p6.ctor) {
				case 'NOP':
					return _elm_lang$core$Maybe$Nothing;
				case 'Resize':
					var _p7 = _p6._0;
					var tabScrollState = A2(
						_elm_lang$core$Maybe$withDefault,
						model.tabScrollState,
						A2(
							_elm_lang$core$Maybe$map,
							function (tabsWidth) {
								var tabScrollState = model.tabScrollState;
								return _elm_lang$core$Native_Utils.update(
									tabScrollState,
									{
										canScrollRight: _elm_lang$core$Native_Utils.cmp(tabsWidth + (2 * 56), _p7) > 0
									});
							},
							model.tabScrollState.width));
					var isSmall = _elm_lang$core$Native_Utils.cmp(1024, _p7) > -1;
					return (_elm_lang$core$Native_Utils.eq(isSmall, model.isSmallScreen) && _elm_lang$core$Native_Utils.eq(tabScrollState.canScrollRight, model.tabScrollState.canScrollRight)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
						_debois$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isSmallScreen: isSmall, isDrawerOpen: (!isSmall) && model.isDrawerOpen, tabScrollState: tabScrollState})));
				case 'ToggleDrawer':
					return _elm_lang$core$Maybe$Just(
						_debois$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isDrawerOpen: !model.isDrawerOpen})));
				case 'Ripple':
					var _p9 = _p6._0;
					return _elm_lang$core$Maybe$Just(
						A2(
							_debois$elm_mdl$Material_Helpers$map2nd,
							_elm_lang$core$Platform_Cmd$map(
								function (_p8) {
									return f(
										A2(_debois$elm_mdl$Material_Layout$Ripple, _p9, _p8));
								}),
							A2(
								_debois$elm_mdl$Material_Helpers$map1st,
								function (ripple_) {
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											ripples: A3(_elm_lang$core$Dict$insert, _p9, ripple_, model.ripples)
										});
								},
								A2(
									_debois$elm_mdl$Material_Ripple$update,
									_p6._1,
									A2(
										_elm_lang$core$Maybe$withDefault,
										_debois$elm_mdl$Material_Ripple$model,
										A2(_elm_lang$core$Dict$get, _p9, model.ripples))))));
				case 'ScrollTab':
					var _p10 = _p6._0;
					return (!_elm_lang$core$Native_Utils.eq(model.tabScrollState, _p10)) ? _elm_lang$core$Maybe$Just(
						_debois$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{tabScrollState: _p10}))) : _elm_lang$core$Maybe$Nothing;
				case 'ScrollPane':
					var isScrolled = _elm_lang$core$Native_Utils.cmp(0.0, _p6._1) < 0;
					if (!_elm_lang$core$Native_Utils.eq(isScrolled, model.isScrolled)) {
						var _v3 = f,
							_v4 = _debois$elm_mdl$Material_Layout$TransitionHeader(
							{toCompact: isScrolled, fixedHeader: _p6._0}),
							_v5 = _elm_lang$core$Native_Utils.update(
							model,
							{isScrolled: isScrolled});
						f = _v3;
						action = _v4;
						model = _v5;
						continue update_;
					} else {
						return _elm_lang$core$Maybe$Nothing;
					}
				case 'TransitionHeader':
					return (!model.isAnimating) ? _elm_lang$core$Maybe$Just(
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{isCompact: _p6._0.toCompact, isAnimating: (!model.isSmallScreen) || _p6._0.fixedHeader}),
							_1: _elm_lang$core$Platform_Cmd$none
						}) : _elm_lang$core$Maybe$Nothing;
				default:
					return _elm_lang$core$Maybe$Just(
						_debois$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isAnimating: false})));
			}
		}
	});
var _debois$elm_mdl$Material_Layout$update = F2(
	function (msg, model) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none},
			A3(_debois$elm_mdl$Material_Layout$update_, _elm_lang$core$Basics$identity, msg, model));
	});
var _debois$elm_mdl$Material_Layout$react = F3(
	function (lift, msg, store) {
		var _p11 = A3(
			_debois$elm_mdl$Material_Layout$update_,
			lift,
			msg,
			_debois$elm_mdl$Material_Layout$get(store));
		if ((_p11.ctor === 'Just') && (_p11._0.ctor === '_Tuple2')) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					A2(_debois$elm_mdl$Material_Layout$set, _p11._0._0, store)),
				_1: _p11._0._1
			};
		} else {
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _debois$elm_mdl$Material_Layout$ScrollPane = F2(
	function (a, b) {
		return {ctor: 'ScrollPane', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Layout$ScrollTab = function (a) {
	return {ctor: 'ScrollTab', _0: a};
};
var _debois$elm_mdl$Material_Layout$Resize = function (a) {
	return {ctor: 'Resize', _0: a};
};
var _debois$elm_mdl$Material_Layout$init = function () {
	var measureScreenSize = A2(_elm_lang$core$Task$perform, _debois$elm_mdl$Material_Layout$Resize, _elm_lang$window$Window$width);
	return {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Layout$defaultModel, _1: measureScreenSize};
}();
var _debois$elm_mdl$Material_Layout$sub0 = function (lift) {
	return A2(
		_elm_lang$core$Platform_Cmd$map,
		function (_p12) {
			return lift(
				_debois$elm_mdl$Material_Component$LayoutMsg(_p12));
		},
		_elm_lang$core$Tuple$second(_debois$elm_mdl$Material_Layout$init));
};
var _debois$elm_mdl$Material_Layout$subscriptions = function (model) {
	return _elm_lang$window$Window$resizes(
		function (_p13) {
			return _debois$elm_mdl$Material_Layout$Resize(
				function (_) {
					return _.width;
				}(_p13));
		});
};
var _debois$elm_mdl$Material_Layout$subs = function (lift) {
	return function (_p14) {
		return A2(
			_elm_lang$core$Platform_Sub$map,
			function (_p15) {
				return lift(
					_debois$elm_mdl$Material_Component$LayoutMsg(_p15));
			},
			_debois$elm_mdl$Material_Layout$subscriptions(
				_debois$elm_mdl$Material_Layout$get(_p14)));
	};
};
var _debois$elm_mdl$Material_Layout$ToggleDrawer = {ctor: 'ToggleDrawer'};
var _debois$elm_mdl$Material_Layout$drawerButton = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer-button', _1: true},
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html_Attributes$attribute,
								'aria-expanded',
								isVisible ? 'true' : 'false'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$tabindex(1),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										lift(_debois$elm_mdl$Material_Layout$ToggleDrawer)),
									_1: {
										ctor: '::',
										_0: A3(
											_elm_lang$html$Html_Events$onWithOptions,
											'keydown',
											{stopPropagation: false, preventDefault: false},
											A2(
												_elm_lang$core$Json_Decode$map,
												function (_p16) {
													return lift(
														function (key) {
															var _p17 = key;
															switch (_p17) {
																case 32:
																	return _debois$elm_mdl$Material_Layout$ToggleDrawer;
																case 13:
																	return _debois$elm_mdl$Material_Layout$ToggleDrawer;
																default:
																	return _debois$elm_mdl$Material_Layout$NOP;
															}
														}(_p16));
												},
												_elm_lang$html$Html_Events$keyCode)),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Icon$i('menu'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_Layout$obfuscator = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__obfuscator', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						lift(_debois$elm_mdl$Material_Layout$ToggleDrawer)),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'});
	});
var _debois$elm_mdl$Material_Layout$toggleDrawer = function (lift) {
	return function (_p18) {
		return lift(
			_debois$elm_mdl$Material_Component$LayoutMsg(_p18));
	}(_debois$elm_mdl$Material_Layout$ToggleDrawer);
};
var _debois$elm_mdl$Material_Layout$Waterfall = function (a) {
	return {ctor: 'Waterfall', _0: a};
};
var _debois$elm_mdl$Material_Layout$waterfall = function (_p19) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (b, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						mode: _debois$elm_mdl$Material_Layout$Waterfall(b)
					});
			})(_p19));
};
var _debois$elm_mdl$Material_Layout$Scrolling = {ctor: 'Scrolling'};
var _debois$elm_mdl$Material_Layout$scrolling = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _debois$elm_mdl$Material_Layout$Scrolling});
	});
var _debois$elm_mdl$Material_Layout$Seamed = {ctor: 'Seamed'};
var _debois$elm_mdl$Material_Layout$seamed = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _debois$elm_mdl$Material_Layout$Seamed});
	});
var _debois$elm_mdl$Material_Layout$Standard = {ctor: 'Standard'};
var _debois$elm_mdl$Material_Layout$defaultConfig = {fixedHeader: false, fixedDrawer: false, fixedTabs: false, rippleTabs: true, mode: _debois$elm_mdl$Material_Layout$Standard, onSelectTab: _elm_lang$core$Maybe$Nothing, selectedTab: -1, moreTabs: false, transparentHeader: false};
var _debois$elm_mdl$Material_Layout$headerView = F6(
	function (lift, config, model, hasHeader, hasDrawer, _p20) {
		var _p21 = _p20;
		var mode = function () {
			var _p22 = config.mode;
			switch (_p22.ctor) {
				case 'Standard':
					return _debois$elm_mdl$Material_Options$nop;
				case 'Scrolling':
					return _debois$elm_mdl$Material_Options$cs('mdl-layout__header--scroll');
				case 'Seamed':
					return _debois$elm_mdl$Material_Options$cs('mdl-layout__header--seamed');
				default:
					if (_p22._0 === true) {
						return _debois$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall mdl-layout__header--waterfall-hide-top');
					} else {
						return _debois$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall');
					}
			}
		}();
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__header'),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						(!hasHeader) && (!hasDrawer),
						A2(_debois$elm_mdl$Material_Options$css, 'min-height', '48px')),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							_elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Standard) || (_debois$elm_mdl$Material_Layout$isWaterfall(config.mode) && model.isCompact),
							_debois$elm_mdl$Material_Options$cs('is-casting-shadow')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								model.isAnimating,
								_debois$elm_mdl$Material_Options$cs('is-animating')),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									model.isCompact,
									_debois$elm_mdl$Material_Options$cs('is-compact')),
								_1: {
									ctor: '::',
									_0: mode,
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											config.transparentHeader,
											_debois$elm_mdl$Material_Options$cs('mdl-layout__header--transparent')),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onClick(
												lift(
													_debois$elm_mdl$Material_Layout$TransitionHeader(
														{toCompact: false, fixedHeader: config.fixedHeader}))),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$on,
													'transitionend',
													_elm_lang$core$Json_Decode$succeed(
														lift(_debois$elm_mdl$Material_Layout$TransitionEnd))),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$List$concatMap,
				function (x) {
					return x;
				},
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Layout$toList(_p21._0),
					_1: {
						ctor: '::',
						_0: _p21._1,
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Layout$toList(_p21._2),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _debois$elm_mdl$Material_Layout$Right = {ctor: 'Right'};
var _debois$elm_mdl$Material_Layout$Left = {ctor: 'Left'};
var _debois$elm_mdl$Material_Layout$tabsView = F4(
	function (lift, config, model, _p23) {
		var _p24 = _p23;
		var _p27 = _p24._1;
		var chevron = F2(
			function (direction, offset) {
				var dir = function () {
					var _p25 = direction;
					if (_p25.ctor === 'Left') {
						return 'left';
					} else {
						return 'right';
					}
				}();
				return A3(
					_debois$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-button'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'mdl-layout__tab-bar-',
									A2(_elm_lang$core$Basics_ops['++'], dir, '-button'))),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									(_elm_lang$core$Native_Utils.eq(direction, _debois$elm_mdl$Material_Layout$Left) && model.tabScrollState.canScrollLeft) || (_elm_lang$core$Native_Utils.eq(direction, _debois$elm_mdl$Material_Layout$Right) && model.tabScrollState.canScrollRight),
									_debois$elm_mdl$Material_Options$cs('is-active')),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$many(_p27),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Icon$view,
							A2(_elm_lang$core$Basics_ops['++'], 'chevron_', dir),
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Icon$size24,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options_Internal$attribute(
										A2(
											_elm_lang$html$Html_Attributes$attribute,
											'onclick',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'document.getElementsByClassName(\'mdl-layout__tab-bar\')[0].scrollLeft += ',
												_elm_lang$core$Basics$toString(offset)))),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					});
			});
		return A2(
			_debois$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-container'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(chevron, _debois$elm_mdl$Material_Layout$Left, -100),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__tab-bar'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'position', 'relative'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'scroll-behavior', 'smooth'),
									_1: {
										ctor: '::',
										_0: config.rippleTabs ? _debois$elm_mdl$Material_Options$many(
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$cs('mds-js-ripple-effect--ignore-events'),
													_1: {ctor: '[]'}
												}
											}) : _debois$elm_mdl$Material_Options$nop,
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Standard) ? _debois$elm_mdl$Material_Options$cs('is-casting-shadow') : _debois$elm_mdl$Material_Options$nop,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$many(_p27),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options_Internal$attribute(
														A2(
															_elm_lang$html$Html_Events$on,
															'scroll',
															_debois$elm_dom$DOM$target(
																A4(
																	_elm_lang$core$Json_Decode$map3,
																	F3(
																		function (scrollWidth, clientWidth, scrollLeft) {
																			return lift(
																				_debois$elm_mdl$Material_Layout$ScrollTab(
																					{
																						canScrollLeft: _elm_lang$core$Native_Utils.cmp(scrollLeft, 0) > 0,
																						canScrollRight: _elm_lang$core$Native_Utils.cmp(scrollWidth - clientWidth, scrollLeft + 1) > 0,
																						width: _elm_lang$core$Maybe$Just(scrollWidth)
																					}));
																		}),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'clientWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float))))),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (tabIndex, tab) {
									return A3(
										_debois$elm_mdl$Material_Helpers$filter,
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$classList(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'mdl-layout__tab', _1: true},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'is-active',
															_1: _elm_lang$core$Native_Utils.eq(tabIndex, config.selectedTab)
														},
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$core$Maybe$withDefault,
													_debois$elm_mdl$Material_Helpers$noAttr,
													A2(
														_elm_lang$core$Maybe$map,
														F2(
															function (x, y) {
																return y(x);
															})(tabIndex),
														config.onSelectTab)),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$core$Maybe$Just(tab),
											_1: {
												ctor: '::',
												_0: config.rippleTabs ? _elm_lang$core$Maybe$Just(
													A2(
														_elm_lang$html$Html$map,
														function (_p26) {
															return lift(
																A2(_debois$elm_mdl$Material_Layout$Ripple, tabIndex, _p26));
														},
														A2(
															_debois$elm_mdl$Material_Ripple$view,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$class('mdl-layout__tab-ripple-container'),
																_1: {ctor: '[]'}
															},
															A2(
																_elm_lang$core$Maybe$withDefault,
																_debois$elm_mdl$Material_Ripple$model,
																A2(_elm_lang$core$Dict$get, tabIndex, model.ripples))))) : _elm_lang$core$Maybe$Nothing,
												_1: {ctor: '[]'}
											}
										});
								}),
							_p24._0)),
					_1: {
						ctor: '::',
						_0: A2(chevron, _debois$elm_mdl$Material_Layout$Right, 100),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _debois$elm_mdl$Material_Layout$view = F4(
	function (lift, model, options, _p28) {
		var _p29 = _p28;
		var _p37 = _p29.tabs;
		var _p36 = _p29.header;
		var _p35 = _p29.drawer;
		var hasDrawer = !_elm_lang$core$Native_Utils.eq(
			_p35,
			{ctor: '[]'});
		var hasHeader = !_elm_lang$core$List$isEmpty(_p36);
		var hasTabs = !_elm_lang$core$List$isEmpty(
			_elm_lang$core$Tuple$first(_p37));
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Layout$defaultConfig, options);
		var config = summary.config;
		var drawerIsFixed = config.fixedDrawer && (!model.isSmallScreen);
		var drawerIsVisible = model.isDrawerOpen && (!drawerIsFixed);
		var _p30 = function () {
			var _p31 = {ctor: '_Tuple3', _0: _p35, _1: _p36, _2: config.fixedHeader};
			if ((_p31.ctor === '_Tuple3') && (_p31._0.ctor === '::')) {
				if ((_p31._1.ctor === '::') && (_p31._2 === true)) {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Nothing,
						_1: _elm_lang$core$Maybe$Just(
							A2(_debois$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible))
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							A2(_debois$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible)),
						_1: _elm_lang$core$Maybe$Nothing
					};
				}
			} else {
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Maybe$Nothing};
			}
		}();
		var contentDrawerButton = _p30._0;
		var headerDrawerButton = _p30._1;
		var tabsElems = (!hasTabs) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A4(_debois$elm_mdl$Material_Layout$tabsView, lift, config, model, _p37));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__container', _1: true},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'has-scrolling-header',
								_1: _elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Scrolling)
							},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_debois$elm_mdl$Material_Helpers$filter,
					_elm_lang$html$Html_Keyed$node('div'),
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Attributes$classList(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'mdl-layout ', _1: true},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'is-upgraded', _1: true},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'is-small-screen', _1: model.isSmallScreen},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'has-drawer', _1: hasDrawer},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'has-tabs', _1: hasTabs},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-js-layout', _1: true},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-drawer', _1: config.fixedDrawer && hasDrawer},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-header', _1: config.fixedHeader && (hasHeader || hasTabs)},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-tabs', _1: config.fixedTabs && hasTabs},
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									})),
							_1: {
								ctor: '::',
								_0: drawerIsVisible ? _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$html$Html_Events$on,
										'keydown',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p32) {
												return lift(
													function (key) {
														return _elm_lang$core$Native_Utils.eq(key, 27) ? _debois$elm_mdl$Material_Layout$ToggleDrawer : _debois$elm_mdl$Material_Layout$NOP;
													}(_p32));
											},
											_elm_lang$html$Html_Events$keyCode))) : _elm_lang$core$Maybe$Nothing,
								_1: {ctor: '[]'}
							}
						}),
					{
						ctor: '::',
						_0: (hasHeader || hasTabs) ? _elm_lang$core$Maybe$Just(
							A2(
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								'elm-mdl-header',
								A6(
									_debois$elm_mdl$Material_Layout$headerView,
									lift,
									config,
									model,
									hasHeader,
									hasDrawer,
									{ctor: '_Tuple3', _0: headerDrawerButton, _1: _p36, _2: tabsElems}))) : _elm_lang$core$Maybe$Nothing,
						_1: {
							ctor: '::',
							_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple2',
									_0: 'elm-mdl-drawer',
									_1: A3(_debois$elm_mdl$Material_Layout$drawerView, lift, drawerIsVisible, _p35)
								}),
							_1: {
								ctor: '::',
								_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple2',
										_0: 'elm-mdl-obfuscator',
										_1: A2(_debois$elm_mdl$Material_Layout$obfuscator, lift, drawerIsVisible)
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Maybe$map,
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											})('elm-drawer-button'),
										contentDrawerButton),
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Maybe$Just(
											A2(
												F2(
													function (v0, v1) {
														return {ctor: '_Tuple2', _0: v0, _1: v1};
													}),
												_elm_lang$core$Basics$toString(config.selectedTab),
												A3(
													_debois$elm_mdl$Material_Options$styled,
													_elm_lang$html$Html$main_,
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$id(_debois$elm_mdl$Material_Layout$mainId),
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Options$cs('mdl-layout__content'),
															_1: {
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Options$when,
																	_elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader,
																	A2(_debois$elm_mdl$Material_Options$css, 'overflow-y', 'visible')),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Options$when,
																		_elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader,
																		A2(_debois$elm_mdl$Material_Options$css, 'overflow-x', 'visible')),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_debois$elm_mdl$Material_Options$when,
																			_elm_lang$core$Native_Utils.eq(config.mode, _debois$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader,
																			A2(_debois$elm_mdl$Material_Options$css, 'overflow', 'visible')),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_debois$elm_mdl$Material_Options$when,
																				_debois$elm_mdl$Material_Layout$isWaterfall(config.mode),
																				function (_p33) {
																					return _debois$elm_mdl$Material_Options_Internal$attribute(
																						A2(_elm_lang$html$Html_Events$on, 'scroll', _p33));
																				}(
																					A2(
																						_elm_lang$core$Json_Decode$map,
																						function (_p34) {
																							return lift(
																								A2(_debois$elm_mdl$Material_Layout$ScrollPane, config.fixedHeader, _p34));
																						},
																						_debois$elm_dom$DOM$target(_debois$elm_dom$DOM$scrollTop)))),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														}
													},
													_p29.main))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_Layout$render = A3(_debois$elm_mdl$Material_Component$render1, _debois$elm_mdl$Material_Layout$get, _debois$elm_mdl$Material_Layout$view, _debois$elm_mdl$Material_Component$LayoutMsg);

var _debois$elm_mdl$Material_Toggles$group = function (_p0) {
	return _debois$elm_mdl$Material_Options$attribute(
		_elm_lang$html$Html_Attributes$name(_p0));
};
var _debois$elm_mdl$Material_Toggles$value = function (_p1) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (b, options) {
				return _elm_lang$core$Native_Utils.update(
					options,
					{value: b});
			})(_p1));
};
var _debois$elm_mdl$Material_Toggles$disabled = _debois$elm_mdl$Material_Options_Internal$attribute(
	_elm_lang$html$Html_Attributes$disabled(true));
var _debois$elm_mdl$Material_Toggles$ripple = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _debois$elm_mdl$Material_Toggles$defaultConfig = {
	value: false,
	ripple: false,
	input: {ctor: '[]'},
	container: {ctor: '[]'}
};
var _debois$elm_mdl$Material_Toggles$defaultModel = {ripple: _debois$elm_mdl$Material_Ripple$model, isFocused: false};
var _debois$elm_mdl$Material_Toggles$_p2 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.toggles;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{toggles: x});
		}),
	_debois$elm_mdl$Material_Toggles$defaultModel);
var _debois$elm_mdl$Material_Toggles$get = _debois$elm_mdl$Material_Toggles$_p2._0;
var _debois$elm_mdl$Material_Toggles$set = _debois$elm_mdl$Material_Toggles$_p2._1;
var _debois$elm_mdl$Material_Toggles$Model = F2(
	function (a, b) {
		return {ripple: a, isFocused: b};
	});
var _debois$elm_mdl$Material_Toggles$Config = F4(
	function (a, b, c, d) {
		return {value: a, ripple: b, input: c, container: d};
	});
var _debois$elm_mdl$Material_Toggles$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _debois$elm_mdl$Material_Toggles$Ripple = function (a) {
	return {ctor: 'Ripple', _0: a};
};
var _debois$elm_mdl$Material_Toggles$update = F2(
	function (action, model) {
		var _p3 = action;
		if (_p3.ctor === 'Ripple') {
			return A2(
				_debois$elm_mdl$Material_Helpers$map2nd,
				_elm_lang$core$Platform_Cmd$map(_debois$elm_mdl$Material_Toggles$Ripple),
				A2(
					_debois$elm_mdl$Material_Helpers$map1st,
					function (r) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{ripple: r});
					},
					A2(_debois$elm_mdl$Material_Ripple$update, _p3._0, model.ripple)));
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: _p3._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _debois$elm_mdl$Material_Toggles$react = A4(
	_debois$elm_mdl$Material_Component$react,
	_debois$elm_mdl$Material_Toggles$get,
	_debois$elm_mdl$Material_Toggles$set,
	_debois$elm_mdl$Material_Component$TogglesMsg,
	_debois$elm_mdl$Material_Component$generalise(_debois$elm_mdl$Material_Toggles$update));
var _debois$elm_mdl$Material_Toggles$top = F5(
	function (lift, kind, model, summary, elems) {
		var cfg = summary.config;
		return A4(
			_debois$elm_mdl$Material_Options_Internal$applyContainer,
			summary,
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs(
					A2(_elm_lang$core$Basics_ops['++'], 'mdl-', kind)),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs(
						A2(_elm_lang$core$Basics_ops['++'], 'mdl-js-', kind)),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							cfg.ripple,
							_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								cfg.ripple,
								_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events')),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$cs('is-upgraded'),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										cfg.value,
										_debois$elm_mdl$Material_Options$cs('is-checked')),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											model.isFocused,
											_debois$elm_mdl$Material_Options$cs('is-focused')),
										_1: {
											ctor: '::',
											_0: A3(
												_debois$elm_mdl$Material_Options_Internal$on1,
												'focus',
												lift,
												_debois$elm_mdl$Material_Toggles$SetFocus(true)),
											_1: {
												ctor: '::',
												_0: A3(
													_debois$elm_mdl$Material_Options_Internal$on1,
													'blur',
													lift,
													_debois$elm_mdl$Material_Toggles$SetFocus(false)),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options_Internal$attribute(
														_debois$elm_mdl$Material_Helpers$blurOn('mouseup')),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: elems,
					_1: {
						ctor: '::',
						_0: cfg.ripple ? {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								function (_p4) {
									return lift(
										_debois$elm_mdl$Material_Toggles$Ripple(_p4));
								},
								A2(
									_debois$elm_mdl$Material_Ripple$view,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-switch__ripple-container mdl-js-ripple-effect mdl-ripple--center'),
										_1: {ctor: '[]'}
									},
									model.ripple)),
							_1: {ctor: '[]'}
						} : {ctor: '[]'},
						_1: {ctor: '[]'}
					}
				}));
	});
var _debois$elm_mdl$Material_Toggles$viewCheckbox = F4(
	function (lift, model, config, elems) {
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Toggles$defaultConfig, config);
		return A5(
			_debois$elm_mdl$Material_Toggles$top,
			lift,
			'checkbox',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_debois$elm_mdl$Material_Options_Internal$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-checkbox__input'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options_Internal$attribute(
								_elm_lang$html$Html_Attributes$type_('checkbox')),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options_Internal$attribute(
									_elm_lang$html$Html_Attributes$checked(summary.config.value)),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__focus-helper'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__box-outline'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__tick-outline'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _debois$elm_mdl$Material_Toggles$checkbox = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Toggles$get, _debois$elm_mdl$Material_Toggles$viewCheckbox, _debois$elm_mdl$Material_Component$TogglesMsg);
var _debois$elm_mdl$Material_Toggles$viewSwitch = F4(
	function (lift, model, config, elems) {
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Toggles$defaultConfig, config);
		return A5(
			_debois$elm_mdl$Material_Toggles$top,
			lift,
			'switch',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_debois$elm_mdl$Material_Options_Internal$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-switch__input'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options_Internal$attribute(
								_elm_lang$html$Html_Attributes$type_('checkbox')),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options_Internal$attribute(
									_elm_lang$html$Html_Attributes$checked(summary.config.value)),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-switch__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-switch__track'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-switch__thumb'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-switch__focus-helper'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _debois$elm_mdl$Material_Toggles$switch = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Toggles$get, _debois$elm_mdl$Material_Toggles$viewSwitch, _debois$elm_mdl$Material_Component$TogglesMsg);
var _debois$elm_mdl$Material_Toggles$viewRadio = F4(
	function (lift, model, config, elems) {
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Toggles$defaultConfig, config);
		return A5(
			_debois$elm_mdl$Material_Toggles$top,
			lift,
			'radio',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_debois$elm_mdl$Material_Options_Internal$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-radio__button'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$attribute(
								_elm_lang$html$Html_Attributes$type_('radio')),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$attribute(
									_elm_lang$html$Html_Attributes$checked(summary.config.value)),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-radio__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-radio__outer-circle'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-radio__inner-circle'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _debois$elm_mdl$Material_Toggles$radio = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Toggles$get, _debois$elm_mdl$Material_Toggles$viewRadio, _debois$elm_mdl$Material_Component$TogglesMsg);

var _debois$elm_mdl$Material_Tooltip$element = function (elem) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{elem: elem});
		});
};
var _debois$elm_mdl$Material_Tooltip$isTooltipClass = function (path) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function ($class) {
			return A2(_elm_lang$core$String$contains, 'mdl-tooltip', $class) ? _elm_lang$core$Json_Decode$succeed(true) : _elm_lang$core$Json_Decode$succeed(false);
		},
		A2(_elm_lang$core$Json_Decode$at, path, _debois$elm_dom$DOM$className));
};
var _debois$elm_mdl$Material_Tooltip$sibling = function (d) {
	var valid = function (path) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (res) {
				return res ? A2(_elm_lang$core$Json_Decode$at, path, d) : _elm_lang$core$Json_Decode$fail('');
			},
			_debois$elm_mdl$Material_Tooltip$isTooltipClass(path));
	};
	var createPath = function (depth) {
		var parents = A2(_elm_lang$core$List$repeat, depth, 'parentElement');
		return A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: 'target',
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				parents,
				{
					ctor: '::',
					_0: 'nextSibling',
					_1: {ctor: '[]'}
				}));
	};
	var paths = A2(
		_elm_lang$core$List$map,
		createPath,
		A2(_elm_lang$core$List$range, 0, 4));
	return _elm_lang$core$Json_Decode$oneOf(
		A2(_elm_lang$core$List$map, valid, paths));
};
var _debois$elm_mdl$Material_Tooltip$update = F2(
	function (action, model) {
		var _p0 = action;
		if (_p0.ctor === 'Enter') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: true, domState: _p0._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _debois$elm_mdl$Material_Tooltip$calculatePos = F2(
	function (pos, domState) {
		var getValuesFor = F2(
			function (l, r) {
				return (_elm_lang$core$Native_Utils.cmp(l + r, 0) < 0) ? {ctor: '_Tuple2', _0: 0, _1: 0} : {ctor: '_Tuple2', _0: l, _1: r};
			});
		var offsetHeight = domState.offsetHeight;
		var marginTop = -1 * (offsetHeight / 2);
		var offsetWidth = domState.offsetWidth;
		var marginLeft = -1 * (offsetWidth / 2);
		var props = domState.rect;
		var left = props.left + (props.width / 2);
		var _p1 = A2(getValuesFor, left, marginLeft);
		var newLeft = _p1._0;
		var newMarginLeft = _p1._1;
		var top = props.top + (props.height / 2);
		var _p2 = A2(getValuesFor, top, marginTop);
		var newTop = _p2._0;
		var newMarginTop = _p2._1;
		var out = function () {
			var _p3 = pos;
			switch (_p3.ctor) {
				case 'Left':
					return {left: (props.left - offsetWidth) - 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Right':
					return {left: (props.left + props.width) + 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Top':
					return {left: newLeft, top: (props.top - offsetHeight) - 10, marginTop: 0, marginLeft: newMarginLeft};
				default:
					return {left: newLeft, top: (props.top + props.height) + 10, marginTop: 0, marginLeft: newMarginLeft};
			}
		}();
		return out;
	});
var _debois$elm_mdl$Material_Tooltip$defaultDOMState = {
	rect: {left: 0, top: 0, width: 0, height: 0},
	offsetWidth: 0,
	offsetHeight: 0
};
var _debois$elm_mdl$Material_Tooltip$defaultPos = {left: 0, top: 0, marginLeft: 0, marginTop: 0};
var _debois$elm_mdl$Material_Tooltip$defaultModel = {isActive: false, domState: _debois$elm_mdl$Material_Tooltip$defaultDOMState};
var _debois$elm_mdl$Material_Tooltip$_p4 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.tooltip;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tooltip: x});
		}),
	_debois$elm_mdl$Material_Tooltip$defaultModel);
var _debois$elm_mdl$Material_Tooltip$get = _debois$elm_mdl$Material_Tooltip$_p4._0;
var _debois$elm_mdl$Material_Tooltip$set = _debois$elm_mdl$Material_Tooltip$_p4._1;
var _debois$elm_mdl$Material_Tooltip$react = A4(
	_debois$elm_mdl$Material_Component$react,
	_debois$elm_mdl$Material_Tooltip$get,
	_debois$elm_mdl$Material_Tooltip$set,
	_debois$elm_mdl$Material_Component$TooltipMsg,
	_debois$elm_mdl$Material_Component$generalise(_debois$elm_mdl$Material_Tooltip$update));
var _debois$elm_mdl$Material_Tooltip$Model = F2(
	function (a, b) {
		return {isActive: a, domState: b};
	});
var _debois$elm_mdl$Material_Tooltip$Pos = F4(
	function (a, b, c, d) {
		return {left: a, top: b, marginLeft: c, marginTop: d};
	});
var _debois$elm_mdl$Material_Tooltip$DOMState = F3(
	function (a, b, c) {
		return {rect: a, offsetWidth: b, offsetHeight: c};
	});
var _debois$elm_mdl$Material_Tooltip$stateDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_debois$elm_mdl$Material_Tooltip$DOMState,
	_debois$elm_dom$DOM$target(_debois$elm_dom$DOM$boundingClientRect),
	_debois$elm_mdl$Material_Tooltip$sibling(_debois$elm_dom$DOM$offsetWidth),
	_debois$elm_mdl$Material_Tooltip$sibling(_debois$elm_dom$DOM$offsetHeight));
var _debois$elm_mdl$Material_Tooltip$Config = F3(
	function (a, b, c) {
		return {size: a, position: b, elem: c};
	});
var _debois$elm_mdl$Material_Tooltip$Leave = {ctor: 'Leave'};
var _debois$elm_mdl$Material_Tooltip$onMouseLeave = F2(
	function (lift, idx) {
		return A2(
			_debois$elm_mdl$Material_Options$on,
			'mouseleave',
			_elm_lang$core$Json_Decode$succeed(
				lift(
					A2(_debois$elm_mdl$Material_Component$TooltipMsg, idx, _debois$elm_mdl$Material_Tooltip$Leave))));
	});
var _debois$elm_mdl$Material_Tooltip$onLeave = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		A2(
			_elm_lang$core$Json_Decode$map,
			lift,
			_elm_lang$core$Json_Decode$succeed(_debois$elm_mdl$Material_Tooltip$Leave)));
};
var _debois$elm_mdl$Material_Tooltip$Enter = function (a) {
	return {ctor: 'Enter', _0: a};
};
var _debois$elm_mdl$Material_Tooltip$onMouseEnter = F2(
	function (lift, idx) {
		return A2(
			_debois$elm_mdl$Material_Options$on,
			'mouseenter',
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p5) {
					return lift(
						A2(
							_debois$elm_mdl$Material_Component$TooltipMsg,
							idx,
							_debois$elm_mdl$Material_Tooltip$Enter(_p5)));
				},
				_debois$elm_mdl$Material_Tooltip$stateDecoder));
	});
var _debois$elm_mdl$Material_Tooltip$attach = F2(
	function (lift, index) {
		return _debois$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Tooltip$onMouseEnter, lift, index),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Tooltip$onMouseLeave, lift, index),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_mdl$Material_Tooltip$onEnter = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		A2(
			_elm_lang$core$Json_Decode$map,
			lift,
			A2(_elm_lang$core$Json_Decode$map, _debois$elm_mdl$Material_Tooltip$Enter, _debois$elm_mdl$Material_Tooltip$stateDecoder)));
};
var _debois$elm_mdl$Material_Tooltip$Large = {ctor: 'Large'};
var _debois$elm_mdl$Material_Tooltip$large = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{size: _debois$elm_mdl$Material_Tooltip$Large});
	});
var _debois$elm_mdl$Material_Tooltip$Default = {ctor: 'Default'};
var _debois$elm_mdl$Material_Tooltip$Bottom = {ctor: 'Bottom'};
var _debois$elm_mdl$Material_Tooltip$defaultConfig = {size: _debois$elm_mdl$Material_Tooltip$Default, position: _debois$elm_mdl$Material_Tooltip$Bottom, elem: _elm_lang$html$Html$div};
var _debois$elm_mdl$Material_Tooltip$view = F4(
	function (lift, model, options, content) {
		var px = function (f) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(f),
				'px');
		};
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Tooltip$defaultConfig, options);
		var config = summary.config;
		var pos = model.isActive ? A2(_debois$elm_mdl$Material_Tooltip$calculatePos, config.position, model.domState) : _debois$elm_mdl$Material_Tooltip$defaultPos;
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			config.elem,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-tooltip'),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						model.isActive,
						_debois$elm_mdl$Material_Options$cs('is-active')),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							_elm_lang$core$Native_Utils.eq(config.size, _debois$elm_mdl$Material_Tooltip$Large),
							_debois$elm_mdl$Material_Options$cs('mdl-tooltip--large')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								model.isActive,
								A2(
									_debois$elm_mdl$Material_Options$css,
									'left',
									px(pos.left))),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									model.isActive,
									A2(
										_debois$elm_mdl$Material_Options$css,
										'margin-left',
										px(pos.marginLeft))),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										model.isActive,
										A2(
											_debois$elm_mdl$Material_Options$css,
											'top',
											px(pos.top))),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											model.isActive,
											A2(
												_debois$elm_mdl$Material_Options$css,
												'margin-top',
												px(pos.marginTop))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			content);
	});
var _debois$elm_mdl$Material_Tooltip$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Tooltip$get, _debois$elm_mdl$Material_Tooltip$view, _debois$elm_mdl$Material_Component$TooltipMsg);
var _debois$elm_mdl$Material_Tooltip$bottom = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _debois$elm_mdl$Material_Tooltip$Bottom});
	});
var _debois$elm_mdl$Material_Tooltip$Top = {ctor: 'Top'};
var _debois$elm_mdl$Material_Tooltip$top = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _debois$elm_mdl$Material_Tooltip$Top});
	});
var _debois$elm_mdl$Material_Tooltip$Right = {ctor: 'Right'};
var _debois$elm_mdl$Material_Tooltip$right = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _debois$elm_mdl$Material_Tooltip$Right});
	});
var _debois$elm_mdl$Material_Tooltip$Left = {ctor: 'Left'};
var _debois$elm_mdl$Material_Tooltip$left = _debois$elm_mdl$Material_Options_Internal$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _debois$elm_mdl$Material_Tooltip$Left});
	});

var _debois$elm_mdl$Material_Tabs$activeTab = function (_p0) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (k, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{activeTab: k});
			})(_p0));
};
var _debois$elm_mdl$Material_Tabs$onSelectTab = function (_p1) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (k, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onSelectTab: _elm_lang$core$Maybe$Just(k)
					});
			})(_p1));
};
var _debois$elm_mdl$Material_Tabs$ripple = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _debois$elm_mdl$Material_Tabs$defaultConfig = {ripple: false, onSelectTab: _elm_lang$core$Maybe$Nothing, activeTab: 0};
var _debois$elm_mdl$Material_Tabs$defaultModel = {ripples: _elm_lang$core$Dict$empty};
var _debois$elm_mdl$Material_Tabs$_p2 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.tabs;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tabs: x});
		}),
	_debois$elm_mdl$Material_Tabs$defaultModel);
var _debois$elm_mdl$Material_Tabs$get = _debois$elm_mdl$Material_Tabs$_p2._0;
var _debois$elm_mdl$Material_Tabs$set = _debois$elm_mdl$Material_Tabs$_p2._1;
var _debois$elm_mdl$Material_Tabs$Model = function (a) {
	return {ripples: a};
};
var _debois$elm_mdl$Material_Tabs$Config = F3(
	function (a, b, c) {
		return {ripple: a, onSelectTab: b, activeTab: c};
	});
var _debois$elm_mdl$Material_Tabs$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Tabs$update = F2(
	function (action, model) {
		var _p3 = action;
		var _p5 = _p3._0;
		var _p4 = A2(
			_debois$elm_mdl$Material_Ripple$update,
			_p3._1,
			A2(
				_elm_lang$core$Maybe$withDefault,
				_debois$elm_mdl$Material_Ripple$model,
				A2(_elm_lang$core$Dict$get, _p5, model.ripples)));
		var ripple_ = _p4._0;
		var cmd = _p4._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					ripples: A3(_elm_lang$core$Dict$insert, _p5, ripple_, model.ripples)
				}),
			_1: A2(
				_elm_lang$core$Platform_Cmd$map,
				_debois$elm_mdl$Material_Tabs$Ripple(_p5),
				cmd)
		};
	});
var _debois$elm_mdl$Material_Tabs$react = A4(
	_debois$elm_mdl$Material_Component$react,
	_debois$elm_mdl$Material_Tabs$get,
	_debois$elm_mdl$Material_Tabs$set,
	_debois$elm_mdl$Material_Component$TabsMsg,
	_debois$elm_mdl$Material_Component$generalise(_debois$elm_mdl$Material_Tabs$update));
var _debois$elm_mdl$Material_Tabs$view = F5(
	function (lift, model, options, tabs, tabContent) {
		var wrapContent = A2(
			_elm_lang$html$Html_Keyed$node,
			'div',
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-tab__panel', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-active', _1: true},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Tabs$defaultConfig, options);
		var config = summary.config;
		var unwrapLabel = F2(
			function (tabIdx, _p6) {
				var _p7 = _p6;
				var _p9 = _p7._0._1;
				return A3(
					_debois$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$a,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-tabs__tab'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								_elm_lang$core$Native_Utils.eq(tabIdx, config.activeTab),
								_debois$elm_mdl$Material_Options$cs('is-active')),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Maybe$withDefault,
									_debois$elm_mdl$Material_Options$nop,
									A2(
										_elm_lang$core$Maybe$map,
										function (t) {
											return _debois$elm_mdl$Material_Options$onClick(
												t(tabIdx));
										},
										config.onSelectTab)),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$many(_p7._0._0),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					config.ripple ? _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: _p9,
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$map,
										function (_p8) {
											return lift(
												A2(_debois$elm_mdl$Material_Tabs$Ripple, tabIdx, _p8));
										},
										A2(
											_debois$elm_mdl$Material_Ripple$view,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$classList(
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-container', _1: true},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-js-effect', _1: true},
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											},
											A2(
												_elm_lang$core$Maybe$withDefault,
												_debois$elm_mdl$Material_Ripple$model,
												A2(_elm_lang$core$Dict$get, tabIdx, model.ripples)))),
									_1: {ctor: '[]'}
								},
								_1: {ctor: '[]'}
							}
						}) : _p9);
			});
		var links = A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-tabs__tab-bar'),
				_1: {ctor: '[]'}
			},
			A2(_elm_lang$core$List$indexedMap, unwrapLabel, tabs));
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-tabs'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-js-tabs'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								config.ripple,
								_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect')),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									config.ripple,
									_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events')),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: links,
				_1: {
					ctor: '::',
					_0: wrapContent(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Basics$toString(config.activeTab),
								_1: A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									tabContent)
							},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_mdl$Material_Tabs$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Tabs$get, _debois$elm_mdl$Material_Tabs$view, _debois$elm_mdl$Material_Component$TabsMsg);
var _debois$elm_mdl$Material_Tabs$Label = function (a) {
	return {ctor: 'Label', _0: a};
};
var _debois$elm_mdl$Material_Tabs$label = F2(
	function (p, c) {
		return _debois$elm_mdl$Material_Tabs$Label(
			{ctor: '_Tuple2', _0: p, _1: c});
	});
var _debois$elm_mdl$Material_Tabs$textLabel = F2(
	function (p, c) {
		return A2(
			_debois$elm_mdl$Material_Tabs$label,
			p,
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(c),
				_1: {ctor: '[]'}
			});
	});

var _debois$elm_mdl$Material_Select$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _debois$elm_mdl$Material_Select$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_debois$elm_mdl$Material_Select$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _debois$elm_mdl$Material_Select$decodeAsInput = A6(
	_elm_lang$core$Json_Decode$map5,
	_debois$elm_mdl$Material_Dropdown_Geometry$Geometry,
	_debois$elm_dom$DOM$target(_debois$elm_mdl$Material_Dropdown_Geometry$element),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			_debois$elm_dom$DOM$nextSibling(
				_debois$elm_dom$DOM$nextSibling(
					A2(_debois$elm_dom$DOM$childNode, 1, _debois$elm_mdl$Material_Dropdown_Geometry$element))))),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			_debois$elm_dom$DOM$nextSibling(
				_debois$elm_dom$DOM$nextSibling(_debois$elm_mdl$Material_Dropdown_Geometry$element)))),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			_debois$elm_dom$DOM$nextSibling(
				_debois$elm_dom$DOM$nextSibling(
					A2(
						_debois$elm_dom$DOM$childNode,
						1,
						_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetTop)))))),
	_debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			_debois$elm_dom$DOM$nextSibling(
				_debois$elm_dom$DOM$nextSibling(
					A2(
						_debois$elm_dom$DOM$childNode,
						1,
						_debois$elm_dom$DOM$childNodes(_debois$elm_dom$DOM$offsetHeight)))))));
var _debois$elm_mdl$Material_Select$ripple = _debois$elm_mdl$Material_Options_Internal$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _debois$elm_mdl$Material_Select$dropdownOption = function (option) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					dropdown: {ctor: '::', _0: option, _1: config.dropdown}
				});
		});
};
var _debois$elm_mdl$Material_Select$index = function (_p1) {
	return _debois$elm_mdl$Material_Select$dropdownOption(
		_debois$elm_mdl$Material_Dropdown$index(_p1));
};
var _debois$elm_mdl$Material_Select$over = _debois$elm_mdl$Material_Select$dropdownOption(_debois$elm_mdl$Material_Dropdown$over);
var _debois$elm_mdl$Material_Select$below = _debois$elm_mdl$Material_Select$dropdownOption(_debois$elm_mdl$Material_Dropdown$below);
var _debois$elm_mdl$Material_Select$textfieldOption = function (option) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					textfield: {ctor: '::', _0: option, _1: config.textfield}
				});
		});
};
var _debois$elm_mdl$Material_Select$value = function (_p2) {
	return _debois$elm_mdl$Material_Select$textfieldOption(
		_debois$elm_mdl$Material_Textfield$value(_p2));
};
var _debois$elm_mdl$Material_Select$label = function (_p3) {
	return _debois$elm_mdl$Material_Select$textfieldOption(
		_debois$elm_mdl$Material_Textfield$label(_p3));
};
var _debois$elm_mdl$Material_Select$floatingLabel = _debois$elm_mdl$Material_Select$textfieldOption(_debois$elm_mdl$Material_Textfield$floatingLabel);
var _debois$elm_mdl$Material_Select$error = function (_p4) {
	return _debois$elm_mdl$Material_Select$textfieldOption(
		_debois$elm_mdl$Material_Textfield$error(_p4));
};
var _debois$elm_mdl$Material_Select$disabled = _debois$elm_mdl$Material_Select$textfieldOption(_debois$elm_mdl$Material_Textfield$disabled);
var _debois$elm_mdl$Material_Select$autofocus = _debois$elm_mdl$Material_Select$textfieldOption(_debois$elm_mdl$Material_Textfield$autofocus);
var _debois$elm_mdl$Material_Select$defaultConfig = {
	textfield: {ctor: '[]'},
	dropdown: {ctor: '[]'},
	ripple: false
};
var _debois$elm_mdl$Material_Select$item = _debois$elm_mdl$Material_Dropdown_Item$item;
var _debois$elm_mdl$Material_Select$defaultModel = {dropdown: _debois$elm_mdl$Material_Dropdown$defaultModel, textfield: _debois$elm_mdl$Material_Textfield$defaultModel, openOnFocus: false};
var _debois$elm_mdl$Material_Select$_p5 = A3(
	_debois$elm_mdl$Material_Component$indexed,
	function (_) {
		return _.select;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{select: x});
		}),
	_debois$elm_mdl$Material_Select$defaultModel);
var _debois$elm_mdl$Material_Select$get = _debois$elm_mdl$Material_Select$_p5._0;
var _debois$elm_mdl$Material_Select$set = _debois$elm_mdl$Material_Select$_p5._1;
var _debois$elm_mdl$Material_Select$Model = F3(
	function (a, b, c) {
		return {dropdown: a, textfield: b, openOnFocus: c};
	});
var _debois$elm_mdl$Material_Select$Config = F3(
	function (a, b, c) {
		return {textfield: a, dropdown: b, ripple: c};
	});
var _debois$elm_mdl$Material_Select$TextfieldMsg = function (a) {
	return {ctor: 'TextfieldMsg', _0: a};
};
var _debois$elm_mdl$Material_Select$MenuMsg = function (a) {
	return {ctor: 'MenuMsg', _0: a};
};
var _debois$elm_mdl$Material_Select$subscriptions = function (model) {
	return model.dropdown.open ? _elm_lang$mouse$Mouse$clicks(
		function (_p6) {
			return _debois$elm_mdl$Material_Select$MenuMsg(
				A2(_debois$elm_mdl$Material_Dropdown$Click, _debois$elm_mdl$Material_Dropdown$Over, _p6));
		}) : _elm_lang$core$Platform_Sub$none;
};
var _debois$elm_mdl$Material_Select$subs = A3(
	_debois$elm_mdl$Material_Component$subs,
	_debois$elm_mdl$Material_Component$SelectMsg,
	function (_) {
		return _.select;
	},
	_debois$elm_mdl$Material_Select$subscriptions);
var _debois$elm_mdl$Material_Select$update = F3(
	function (fwd, msg, model) {
		var _p7 = msg;
		switch (_p7.ctor) {
			case 'MenuMsg':
				var _p8 = A3(
					_debois$elm_mdl$Material_Dropdown$update,
					function (_p9) {
						return fwd(
							_debois$elm_mdl$Material_Select$MenuMsg(_p9));
					},
					_p7._0,
					model.dropdown);
				var dropdown = _p8._0;
				var cmds = _p8._1;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{dropdown: dropdown}),
					{
						ctor: '::',
						_0: cmds,
						_1: {ctor: '[]'}
					});
			case 'TextfieldMsg':
				var _p10 = A3(
					_debois$elm_mdl$Material_Textfield$update,
					{ctor: '_Tuple0'},
					_p7._0,
					model.textfield);
				var textfield = _p10._0;
				var cmd = _p10._1;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							textfield: A2(_elm_lang$core$Maybe$withDefault, model.textfield, textfield)
						}),
					{
						ctor: '::',
						_0: cmd,
						_1: {ctor: '[]'}
					});
			case 'Click':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{openOnFocus: true}),
					{ctor: '[]'});
			case 'Open':
				var msg_ = _debois$elm_mdl$Material_Dropdown$Open(_p7._0);
				var _p11 = A3(
					_debois$elm_mdl$Material_Dropdown$update,
					function (_p12) {
						return fwd(
							_debois$elm_mdl$Material_Select$MenuMsg(_p12));
					},
					msg_,
					model.dropdown);
				var dropdown = _p11._0;
				var cmds = _p11._1;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{dropdown: dropdown}),
					{
						ctor: '::',
						_0: cmds,
						_1: {ctor: '[]'}
					});
			case 'Focus':
				if (model.openOnFocus) {
					var msg_ = _debois$elm_mdl$Material_Dropdown$Open(_p7._0);
					var _p13 = A3(
						_debois$elm_mdl$Material_Dropdown$update,
						function (_p14) {
							return fwd(
								_debois$elm_mdl$Material_Select$MenuMsg(_p14));
						},
						msg_,
						model.dropdown);
					var dropdown = _p13._0;
					var cmds = _p13._1;
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{dropdown: dropdown, openOnFocus: false}),
						{
							ctor: '::',
							_0: cmds,
							_1: {ctor: '[]'}
						});
				} else {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{ctor: '[]'});
				}
			case 'Blur':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{openOnFocus: false}),
					{ctor: '[]'});
			default:
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{ctor: '[]'});
		}
	});
var _debois$elm_mdl$Material_Select$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			function (_p15) {
				return _elm_lang$core$Maybe$Just(
					A3(_debois$elm_mdl$Material_Select$set, idx, store, _p15));
			},
			A3(
				_debois$elm_mdl$Material_Select$update,
				lift,
				msg,
				A2(_debois$elm_mdl$Material_Select$get, idx, store)));
	});
var _debois$elm_mdl$Material_Select$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _debois$elm_mdl$Material_Select$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _debois$elm_mdl$Material_Select$Blur = {ctor: 'Blur'};
var _debois$elm_mdl$Material_Select$Focus = function (a) {
	return {ctor: 'Focus', _0: a};
};
var _debois$elm_mdl$Material_Select$Click = {ctor: 'Click'};
var _debois$elm_mdl$Material_Select$view = F4(
	function (lift, model, properties, items) {
		var itemSummaries = A2(
			_elm_lang$core$List$map,
			function (_p16) {
				return A2(
					_debois$elm_mdl$Material_Options_Internal$collect,
					_debois$elm_mdl$Material_Dropdown_Item$defaultConfig,
					function (_) {
						return _.options;
					}(_p16));
			},
			items);
		var ripple = A2(
			_elm_lang$core$Maybe$withDefault,
			_debois$elm_mdl$Material_Ripple$model,
			A2(_elm_lang$core$Dict$get, -1, model.dropdown.ripples));
		var fwdRipple = function (_p17) {
			return lift(
				_debois$elm_mdl$Material_Select$MenuMsg(
					A2(
						_debois$elm_mdl$Material_Dropdown$ItemMsg,
						-1,
						_debois$elm_mdl$Material_Dropdown_Item$Ripple(_p17))));
		};
		var _p18 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Select$defaultConfig, properties);
		var summary = _p18;
		var config = _p18.config;
		var dropdownOptions = config.dropdown;
		var dropdownSummary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Dropdown$defaultConfig, dropdownOptions);
		var dropdownConfig = dropdownSummary.config;
		var defaultIndex = A2(_debois$elm_mdl$Material_Dropdown$defaultIndex, model.dropdown, dropdownConfig.index);
		var dropdown = A4(
			_debois$elm_mdl$Material_Dropdown$view,
			function (_p19) {
				return lift(
					_debois$elm_mdl$Material_Select$MenuMsg(_p19));
			},
			model.dropdown,
			{ctor: '::', _0: _debois$elm_mdl$Material_Dropdown$over, _1: dropdownOptions},
			items);
		var textfieldOptions = _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: config.textfield,
				_1: {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$on,
							'keydown',
							A2(
								_elm_lang$core$Json_Decode$map,
								function (_p20) {
									return lift(
										_debois$elm_mdl$Material_Select$MenuMsg(_p20));
								},
								A3(
									_elm_lang$core$Json_Decode$map2,
									A2(_debois$elm_mdl$Material_Dropdown$Key, defaultIndex, itemSummaries),
									_elm_lang$html$Html_Events$keyCode,
									_debois$elm_mdl$Material_Select$decodeAsInput))),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$on,
								'blur',
								_elm_lang$core$Json_Decode$succeed(
									lift(_debois$elm_mdl$Material_Select$Blur))),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$on,
									'input',
									A2(
										_elm_lang$core$Json_Decode$map,
										function (_p21) {
											return lift(
												_debois$elm_mdl$Material_Select$Input(_p21));
										},
										_elm_lang$html$Html_Events$targetValue)),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										config.ripple,
										A2(
											_debois$elm_mdl$Material_Options$on,
											'focus',
											A2(
												_elm_lang$core$Json_Decode$map,
												function (_p22) {
													return lift(
														_debois$elm_mdl$Material_Select$Focus(_p22));
												},
												_debois$elm_mdl$Material_Select$decodeAsInput))),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											!config.ripple,
											A2(
												_debois$elm_mdl$Material_Options$on,
												'click',
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p23) {
														return lift(
															_debois$elm_mdl$Material_Select$Open(_p23));
													},
													_debois$elm_mdl$Material_Select$decodeAsInput))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					_1: {ctor: '[]'}
				}
			});
		var textfieldSummary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Textfield$defaultConfig, textfieldOptions);
		var textfieldConfig = textfieldSummary.config;
		var trigger = {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$map,
				lift,
				A2(
					_debois$elm_mdl$Material_Icon$view,
					'expand_more',
					{ctor: '[]'})),
			_1: {
				ctor: '::',
				_0: A4(
					_debois$elm_mdl$Material_Textfield$view,
					function (_p24) {
						return lift(
							_debois$elm_mdl$Material_Select$TextfieldMsg(_p24));
					},
					model.textfield,
					textfieldOptions,
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A4(
						_debois$elm_mdl$Material_Options$styled_,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-select__trigger'),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$css,
									'display',
									config.ripple ? 'block' : 'none'),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$on,
										'click',
										_elm_lang$core$Json_Decode$succeed(
											lift(_debois$elm_mdl$Material_Select$Click))),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Ripple$downOn_, fwdRipple, 'mousedown'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Ripple$downOn_, fwdRipple, 'touchstart'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'mouseup'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'mouseleave'),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'touchend'),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Ripple$upOn_, fwdRipple, 'blur'),
												_1: {
													ctor: '::',
													_0: A2(_elm_lang$html$Html_Attributes$attribute, 'onclick', 'this.previousSibling.firstChild.focus()'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								fwdRipple,
								A2(
									_debois$elm_mdl$Material_Ripple$view_,
									{ctor: '[]'},
									ripple)),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		};
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-select'),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						model.dropdown.open,
						_debois$elm_mdl$Material_Options$cs('mdl-js-ripple-effect')),
					_1: properties
				}
			},
			{ctor: '[]'},
			A2(
				_elm_lang$core$Basics_ops['++'],
				trigger,
				{
					ctor: '::',
					_0: dropdown,
					_1: {ctor: '[]'}
				}));
	});
var _debois$elm_mdl$Material_Select$render = A3(_debois$elm_mdl$Material_Component$render, _debois$elm_mdl$Material_Select$get, _debois$elm_mdl$Material_Select$view, _debois$elm_mdl$Material_Component$SelectMsg);

var _debois$elm_mdl$Material$init = function (lift) {
	return _debois$elm_mdl$Material_Layout$sub0(lift);
};
var _debois$elm_mdl$Material$subscriptions = F2(
	function (lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Layout$subs, lift, model.mdl),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Menu$subs, lift, model.mdl),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Select$subs, lift, model.mdl),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _debois$elm_mdl$Material$update_ = F3(
	function (lift, msg, store) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'ButtonMsg':
				return A4(_debois$elm_mdl$Material_Button$react, lift, _p0._1, _p0._0, store);
			case 'TextfieldMsg':
				return A4(_debois$elm_mdl$Material_Textfield$react, lift, _p0._1, _p0._0, store);
			case 'MenuMsg':
				var _p2 = _p0._0;
				return A4(
					_debois$elm_mdl$Material_Menu$react,
					function (_p1) {
						return lift(
							A2(_debois$elm_mdl$Material_Component$MenuMsg, _p2, _p1));
					},
					_p0._1,
					_p2,
					store);
			case 'LayoutMsg':
				return A3(
					_debois$elm_mdl$Material_Layout$react,
					function (_p3) {
						return lift(
							_debois$elm_mdl$Material_Component$LayoutMsg(_p3));
					},
					_p0._0,
					store);
			case 'TogglesMsg':
				return A4(_debois$elm_mdl$Material_Toggles$react, lift, _p0._1, _p0._0, store);
			case 'TooltipMsg':
				return A4(_debois$elm_mdl$Material_Tooltip$react, lift, _p0._1, _p0._0, store);
			case 'TabsMsg':
				return A4(_debois$elm_mdl$Material_Tabs$react, lift, _p0._1, _p0._0, store);
			case 'SelectMsg':
				var _p5 = _p0._0;
				return A4(
					_debois$elm_mdl$Material_Select$react,
					function (_p4) {
						return lift(
							A2(_debois$elm_mdl$Material_Component$SelectMsg, _p5, _p4));
					},
					_p0._1,
					_p5,
					store);
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: _debois$elm_mdl$Material_Dispatch$forward(_p0._0)
				};
		}
	});
var _debois$elm_mdl$Material$update = F3(
	function (lift, msg, container) {
		return A2(
			_debois$elm_mdl$Material_Helpers$map1st,
			_elm_lang$core$Maybe$withDefault(container),
			A2(
				_debois$elm_mdl$Material_Helpers$map1st,
				_elm_lang$core$Maybe$map(
					function (mdl) {
						return _elm_lang$core$Native_Utils.update(
							container,
							{mdl: mdl});
					}),
				A3(
					_debois$elm_mdl$Material$update_,
					lift,
					msg,
					function (_) {
						return _.mdl;
					}(container))));
	});
var _debois$elm_mdl$Material$model = {button: _elm_lang$core$Dict$empty, textfield: _elm_lang$core$Dict$empty, menu: _elm_lang$core$Dict$empty, snackbar: _elm_lang$core$Maybe$Nothing, layout: _debois$elm_mdl$Material_Layout$defaultModel, toggles: _elm_lang$core$Dict$empty, tooltip: _elm_lang$core$Dict$empty, tabs: _elm_lang$core$Dict$empty, select: _elm_lang$core$Dict$empty};
var _debois$elm_mdl$Material$Model = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {button: a, textfield: b, menu: c, snackbar: d, layout: e, toggles: f, tooltip: g, tabs: h, select: i};
	});

var _debois$elm_mdl$Material_Card$stopClick = _debois$elm_mdl$Material_Options_Internal$attribute(
	A2(_elm_lang$html$Html_Attributes$attribute, 'onclick', 'var event = arguments[0] || window.event; event.stopPropagation();'));
var _debois$elm_mdl$Material_Card$block = function (block) {
	var _p0 = block;
	switch (_p0.ctor) {
		case 'Title':
			return A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card__title'),
					_1: _p0._0
				},
				_p0._1);
		case 'Media':
			return A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card__media'),
					_1: _p0._0
				},
				_p0._1);
		case 'SupportingText':
			return A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card__supporting-text'),
					_1: _p0._0
				},
				_p0._1);
		case 'Actions':
			return A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card__actions'),
					_1: {ctor: '::', _0: _debois$elm_mdl$Material_Card$stopClick, _1: _p0._0}
				},
				_p0._1);
		default:
			return A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card__menu'),
					_1: {ctor: '::', _0: _debois$elm_mdl$Material_Card$stopClick, _1: _p0._0}
				},
				_p0._1);
	}
};
var _debois$elm_mdl$Material_Card$view = F2(
	function (styling, views) {
		return A2(
			_debois$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$many(styling),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-card'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'min-height', '0px'),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(_elm_lang$core$List$map, _debois$elm_mdl$Material_Card$block, views));
	});
var _debois$elm_mdl$Material_Card$subhead = function (styling) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-card__subtitle-text'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'padding-top', '8px'),
				_1: styling
			}
		});
};
var _debois$elm_mdl$Material_Card$head = function (styling) {
	return A2(
		_debois$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$h1,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-card__title-text'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'align-self', 'flex-start'),
				_1: styling
			}
		});
};
var _debois$elm_mdl$Material_Card$expand = _debois$elm_mdl$Material_Options$cs('mdl-card--expand');
var _debois$elm_mdl$Material_Card$border = _debois$elm_mdl$Material_Options$cs('mdl-card--border');
var _debois$elm_mdl$Material_Card$Actions = F2(
	function (a, b) {
		return {ctor: 'Actions', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Card$actions = _debois$elm_mdl$Material_Card$Actions;
var _debois$elm_mdl$Material_Card$SupportingText = F2(
	function (a, b) {
		return {ctor: 'SupportingText', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Card$text = _debois$elm_mdl$Material_Card$SupportingText;
var _debois$elm_mdl$Material_Card$Media = F2(
	function (a, b) {
		return {ctor: 'Media', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Card$media = _debois$elm_mdl$Material_Card$Media;
var _debois$elm_mdl$Material_Card$Menu = F2(
	function (a, b) {
		return {ctor: 'Menu', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Card$menu = F2(
	function (styling, block) {
		return A2(_debois$elm_mdl$Material_Card$Menu, styling, block);
	});
var _debois$elm_mdl$Material_Card$Title = F2(
	function (a, b) {
		return {ctor: 'Title', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Card$title = F2(
	function (styling, block) {
		return A2(
			_debois$elm_mdl$Material_Card$Title,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$many(styling),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'justify-content', 'flex-end'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'flex-start'),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			block);
	});

var _debois$elm_mdl$Material_Chip$hasValue = function (m) {
	var _p0 = m;
	if (_p0.ctor === 'Just') {
		return true;
	} else {
		return false;
	}
};
var _debois$elm_mdl$Material_Chip$renderItem = function (item) {
	var _p1 = item;
	switch (_p1.ctor) {
		case 'Contact':
			return A3(
				_debois$elm_mdl$Material_Options$styled,
				_p1._0,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-chip__contact'),
					_1: _p1._1
				},
				_p1._2);
		case 'Text':
			return A3(
				_debois$elm_mdl$Material_Options$styled,
				_elm_lang$html$Html$span,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-chip__text'),
					_1: _p1._0
				},
				_p1._1);
		default:
			return A3(
				_debois$elm_mdl$Material_Options$styled,
				_p1._0,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-chip__action'),
					_1: _p1._1
				},
				_p1._2);
	}
};
var _debois$elm_mdl$Material_Chip$priority = function (item) {
	var _p2 = item;
	switch (_p2.ctor) {
		case 'Contact':
			return 0;
		case 'Text':
			return 1;
		default:
			return 2;
	}
};
var _debois$elm_mdl$Material_Chip$deleteClick = function (_p3) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (msg, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						deleteClick: _elm_lang$core$Maybe$Just(
							A3(
								_elm_lang$html$Html_Events$onWithOptions,
								'click',
								{stopPropagation: true, preventDefault: true},
								_elm_lang$core$Json_Decode$succeed(msg)))
					});
			})(_p3));
};
var _debois$elm_mdl$Material_Chip$deleteLink = function (_p4) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (link, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						deleteLink: _elm_lang$core$Maybe$Just(
							_elm_lang$html$Html_Attributes$href(link))
					});
			})(_p4));
};
var _debois$elm_mdl$Material_Chip$deleteIcon = function (_p5) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (icon, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						deleteIcon: _elm_lang$core$Maybe$Just(icon)
					});
			})(_p5));
};
var _debois$elm_mdl$Material_Chip$defaultConfig = {deleteIcon: _elm_lang$core$Maybe$Nothing, deleteLink: _elm_lang$core$Maybe$Nothing, deleteClick: _elm_lang$core$Maybe$Nothing};
var _debois$elm_mdl$Material_Chip$Config = F3(
	function (a, b, c) {
		return {deleteIcon: a, deleteLink: b, deleteClick: c};
	});
var _debois$elm_mdl$Material_Chip$Action = F3(
	function (a, b, c) {
		return {ctor: 'Action', _0: a, _1: b, _2: c};
	});
var _debois$elm_mdl$Material_Chip$action = _debois$elm_mdl$Material_Chip$Action;
var _debois$elm_mdl$Material_Chip$getActionElement = function (config) {
	var click = function () {
		var _p6 = config.deleteClick;
		if (_p6.ctor === 'Just') {
			return _debois$elm_mdl$Material_Options_Internal$attribute(_p6._0);
		} else {
			return _debois$elm_mdl$Material_Options$nop;
		}
	}();
	var link = function () {
		var _p7 = config.deleteLink;
		if (_p7.ctor === 'Just') {
			return _debois$elm_mdl$Material_Options_Internal$attribute(_p7._0);
		} else {
			return _debois$elm_mdl$Material_Options$nop;
		}
	}();
	var hasClick = _debois$elm_mdl$Material_Chip$hasValue(config.deleteClick);
	var hasLink = _debois$elm_mdl$Material_Chip$hasValue(config.deleteLink);
	var actionElement = hasLink ? _elm_lang$html$Html$a : _elm_lang$html$Html$span;
	var hasIcon = _debois$elm_mdl$Material_Chip$hasValue(config.deleteIcon);
	var icon = hasIcon ? A2(_elm_lang$core$Maybe$withDefault, '', config.deleteIcon) : ((hasLink || hasClick) ? A2(_elm_lang$core$Maybe$withDefault, 'cancel', config.deleteIcon) : '');
	var isDeletable = hasIcon || (hasLink || hasClick);
	return isDeletable ? _elm_lang$core$Maybe$Just(
		A3(
			_debois$elm_mdl$Material_Chip$action,
			actionElement,
			{
				ctor: '::',
				_0: link,
				_1: {
					ctor: '::',
					_0: click,
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Icon$view,
					icon,
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			})) : _elm_lang$core$Maybe$Nothing;
};
var _debois$elm_mdl$Material_Chip$chip = F3(
	function (element, props, items) {
		var isContact = A2(
			_elm_lang$core$List$any,
			function (x) {
				return _elm_lang$core$Native_Utils.eq(
					_debois$elm_mdl$Material_Chip$priority(x),
					0);
			},
			items);
		var summary = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Chip$defaultConfig, props);
		var config = summary.config;
		var action = _debois$elm_mdl$Material_Chip$getActionElement(config);
		var isDeletable = _debois$elm_mdl$Material_Chip$hasValue(action);
		var withIcon = A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p8 = action;
				if (_p8.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _p8._0,
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			items);
		var content = A2(
			_elm_lang$core$List$map,
			_debois$elm_mdl$Material_Chip$renderItem,
			A2(_elm_lang$core$List$sortBy, _debois$elm_mdl$Material_Chip$priority, withIcon));
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			element,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-chip'),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							isContact,
							_debois$elm_mdl$Material_Options$cs('mdl-chip--contact')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								isDeletable,
								_debois$elm_mdl$Material_Options$cs('mdl-chip--deletable')),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options_Internal$attribute(
									_debois$elm_mdl$Material_Helpers$blurOn('mouseup')),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options_Internal$attribute(
										_debois$elm_mdl$Material_Helpers$blurOn('mouseleave')),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options_Internal$attribute(
											_debois$elm_mdl$Material_Helpers$blurOn('touchend')),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				},
				props),
			content);
	});
var _debois$elm_mdl$Material_Chip$button = function (props) {
	return A2(
		_debois$elm_mdl$Material_Chip$chip,
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options_Internal$attribute(
				_elm_lang$html$Html_Attributes$type_('button')),
			_1: props
		});
};
var _debois$elm_mdl$Material_Chip$span = _debois$elm_mdl$Material_Chip$chip(_elm_lang$html$Html$span);
var _debois$elm_mdl$Material_Chip$Text = F2(
	function (a, b) {
		return {ctor: 'Text', _0: a, _1: b};
	});
var _debois$elm_mdl$Material_Chip$content = _debois$elm_mdl$Material_Chip$Text;
var _debois$elm_mdl$Material_Chip$text = F2(
	function (props, txt) {
		return A2(
			_debois$elm_mdl$Material_Chip$Text,
			props,
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(txt),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_Chip$Contact = F3(
	function (a, b, c) {
		return {ctor: 'Contact', _0: a, _1: b, _2: c};
	});
var _debois$elm_mdl$Material_Chip$contact = _debois$elm_mdl$Material_Chip$Contact;

var _debois$elm_mdl$Material_Color$text = function (_p0) {
	var _p1 = _p0;
	return _debois$elm_mdl$Material_Options$cs(
		A2(_elm_lang$core$Basics_ops['++'], 'mdl-color-text--', _p1._0));
};
var _debois$elm_mdl$Material_Color$background = function (_p2) {
	var _p3 = _p2;
	return _debois$elm_mdl$Material_Options$cs(
		A2(_elm_lang$core$Basics_ops['++'], 'mdl-color--', _p3._0));
};
var _debois$elm_mdl$Material_Color$shadeName = function (shade) {
	var _p4 = shade;
	switch (_p4.ctor) {
		case 'S50':
			return '50';
		case 'S100':
			return '100';
		case 'S200':
			return '200';
		case 'S300':
			return '300';
		case 'S400':
			return '400';
		case 'S500':
			return '500';
		case 'S600':
			return '600';
		case 'S700':
			return '700';
		case 'S800':
			return '800';
		case 'S900':
			return '900';
		case 'A100':
			return 'A100';
		case 'A200':
			return 'A200';
		case 'A400':
			return 'A400';
		default:
			return 'A700';
	}
};
var _debois$elm_mdl$Material_Color$hueName = function (color) {
	var _p5 = color;
	switch (_p5.ctor) {
		case 'Indigo':
			return 'indigo';
		case 'Blue':
			return 'blue';
		case 'LightBlue':
			return 'light-blue';
		case 'Cyan':
			return 'cyan';
		case 'Teal':
			return 'teal';
		case 'Green':
			return 'green';
		case 'LightGreen':
			return 'light-green';
		case 'Lime':
			return 'lime';
		case 'Yellow':
			return 'yellow';
		case 'Amber':
			return 'amber';
		case 'Orange':
			return 'orange';
		case 'Brown':
			return 'brown';
		case 'BlueGrey':
			return 'blue-grey';
		case 'Grey':
			return 'grey';
		case 'DeepOrange':
			return 'deep-orange';
		case 'Red':
			return 'red';
		case 'Pink':
			return 'pink';
		case 'Purple':
			return 'purple';
		default:
			return 'deep-purple';
	}
};
var _debois$elm_mdl$Material_Color$scheme = F2(
	function (primary, accent) {
		var q = _elm_lang$core$String$map(
			function (x) {
				return _elm_lang$core$Native_Utils.eq(
					x,
					_elm_lang$core$Native_Utils.chr('-')) ? _elm_lang$core$Native_Utils.chr('_') : x;
			});
		var cssFile = function () {
			var _p6 = accent;
			switch (_p6.ctor) {
				case 'Grey':
					return '';
				case 'Brown':
					return '';
				case 'BlueGrey':
					return '';
				default:
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'.',
						A2(
							_elm_lang$core$Basics_ops['++'],
							q(
								_debois$elm_mdl$Material_Color$hueName(primary)),
							A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								q(
									_debois$elm_mdl$Material_Color$hueName(accent)))));
			}
		}();
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'material',
			A2(_elm_lang$core$Basics_ops['++'], cssFile, '.min.css'));
	});
var _debois$elm_mdl$Material_Color$DeepPurple = {ctor: 'DeepPurple'};
var _debois$elm_mdl$Material_Color$Purple = {ctor: 'Purple'};
var _debois$elm_mdl$Material_Color$Pink = {ctor: 'Pink'};
var _debois$elm_mdl$Material_Color$Red = {ctor: 'Red'};
var _debois$elm_mdl$Material_Color$DeepOrange = {ctor: 'DeepOrange'};
var _debois$elm_mdl$Material_Color$Grey = {ctor: 'Grey'};
var _debois$elm_mdl$Material_Color$BlueGrey = {ctor: 'BlueGrey'};
var _debois$elm_mdl$Material_Color$Brown = {ctor: 'Brown'};
var _debois$elm_mdl$Material_Color$Orange = {ctor: 'Orange'};
var _debois$elm_mdl$Material_Color$Amber = {ctor: 'Amber'};
var _debois$elm_mdl$Material_Color$Yellow = {ctor: 'Yellow'};
var _debois$elm_mdl$Material_Color$Lime = {ctor: 'Lime'};
var _debois$elm_mdl$Material_Color$LightGreen = {ctor: 'LightGreen'};
var _debois$elm_mdl$Material_Color$Green = {ctor: 'Green'};
var _debois$elm_mdl$Material_Color$Teal = {ctor: 'Teal'};
var _debois$elm_mdl$Material_Color$Cyan = {ctor: 'Cyan'};
var _debois$elm_mdl$Material_Color$LightBlue = {ctor: 'LightBlue'};
var _debois$elm_mdl$Material_Color$Blue = {ctor: 'Blue'};
var _debois$elm_mdl$Material_Color$Indigo = {ctor: 'Indigo'};
var _debois$elm_mdl$Material_Color$hues = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _debois$elm_mdl$Material_Color$Indigo,
		_1: {
			ctor: '::',
			_0: _debois$elm_mdl$Material_Color$Blue,
			_1: {
				ctor: '::',
				_0: _debois$elm_mdl$Material_Color$LightBlue,
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$Cyan,
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$Teal,
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$Green,
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$LightGreen,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$Lime,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Color$Yellow,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Color$Amber,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Color$Orange,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Color$Brown,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Color$BlueGrey,
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Color$Grey,
															_1: {
																ctor: '::',
																_0: _debois$elm_mdl$Material_Color$DeepOrange,
																_1: {
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Color$Red,
																	_1: {
																		ctor: '::',
																		_0: _debois$elm_mdl$Material_Color$Pink,
																		_1: {
																			ctor: '::',
																			_0: _debois$elm_mdl$Material_Color$Purple,
																			_1: {
																				ctor: '::',
																				_0: _debois$elm_mdl$Material_Color$DeepPurple,
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _debois$elm_mdl$Material_Color$accentHues = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _debois$elm_mdl$Material_Color$Indigo,
		_1: {
			ctor: '::',
			_0: _debois$elm_mdl$Material_Color$Blue,
			_1: {
				ctor: '::',
				_0: _debois$elm_mdl$Material_Color$LightBlue,
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$Cyan,
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$Teal,
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$Green,
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$LightGreen,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$Lime,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Color$Yellow,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Color$Amber,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Color$Orange,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Color$DeepOrange,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Color$Red,
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Color$Pink,
															_1: {
																ctor: '::',
																_0: _debois$elm_mdl$Material_Color$Purple,
																_1: {
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Color$DeepPurple,
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _debois$elm_mdl$Material_Color$A700 = {ctor: 'A700'};
var _debois$elm_mdl$Material_Color$A400 = {ctor: 'A400'};
var _debois$elm_mdl$Material_Color$A200 = {ctor: 'A200'};
var _debois$elm_mdl$Material_Color$A100 = {ctor: 'A100'};
var _debois$elm_mdl$Material_Color$S900 = {ctor: 'S900'};
var _debois$elm_mdl$Material_Color$S800 = {ctor: 'S800'};
var _debois$elm_mdl$Material_Color$S700 = {ctor: 'S700'};
var _debois$elm_mdl$Material_Color$S600 = {ctor: 'S600'};
var _debois$elm_mdl$Material_Color$S500 = {ctor: 'S500'};
var _debois$elm_mdl$Material_Color$S400 = {ctor: 'S400'};
var _debois$elm_mdl$Material_Color$S300 = {ctor: 'S300'};
var _debois$elm_mdl$Material_Color$S200 = {ctor: 'S200'};
var _debois$elm_mdl$Material_Color$S100 = {ctor: 'S100'};
var _debois$elm_mdl$Material_Color$S50 = {ctor: 'S50'};
var _debois$elm_mdl$Material_Color$shades = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _debois$elm_mdl$Material_Color$S50,
		_1: {
			ctor: '::',
			_0: _debois$elm_mdl$Material_Color$S100,
			_1: {
				ctor: '::',
				_0: _debois$elm_mdl$Material_Color$S200,
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$S300,
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$S400,
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$S500,
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$S600,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$S700,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Color$S800,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Color$S900,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Color$A100,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Color$A200,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Color$A400,
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Color$A700,
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _debois$elm_mdl$Material_Color$C = function (a) {
	return {ctor: 'C', _0: a};
};
var _debois$elm_mdl$Material_Color$color = F2(
	function (hue, shade) {
		return _debois$elm_mdl$Material_Color$C(
			A2(
				_elm_lang$core$Basics_ops['++'],
				_debois$elm_mdl$Material_Color$hueName(hue),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'-',
					_debois$elm_mdl$Material_Color$shadeName(shade))));
	});
var _debois$elm_mdl$Material_Color$white = _debois$elm_mdl$Material_Color$C('white');
var _debois$elm_mdl$Material_Color$black = _debois$elm_mdl$Material_Color$C('black');
var _debois$elm_mdl$Material_Color$primary = _debois$elm_mdl$Material_Color$C('primary');
var _debois$elm_mdl$Material_Color$primaryDark = _debois$elm_mdl$Material_Color$C('primary-dark');
var _debois$elm_mdl$Material_Color$primaryContrast = _debois$elm_mdl$Material_Color$C('primary-contrast');
var _debois$elm_mdl$Material_Color$accent = _debois$elm_mdl$Material_Color$C('accent');
var _debois$elm_mdl$Material_Color$accentContrast = _debois$elm_mdl$Material_Color$C('accent-contrast');

var _debois$elm_mdl$Material_Elevation$transition = function (duration) {
	return A2(
		_debois$elm_mdl$Material_Options$css,
		'transition',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'box-shadow ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(duration),
				'ms ease-in-out 0s')));
};
var _debois$elm_mdl$Material_Elevation$e0 = _debois$elm_mdl$Material_Options$nop;
var _debois$elm_mdl$Material_Elevation$shadow = function (z) {
	return _debois$elm_mdl$Material_Options$cs(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'mdl-shadow--',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(z),
				'dp')));
};
var _debois$elm_mdl$Material_Elevation$e2 = _debois$elm_mdl$Material_Elevation$shadow(2);
var _debois$elm_mdl$Material_Elevation$e3 = _debois$elm_mdl$Material_Elevation$shadow(3);
var _debois$elm_mdl$Material_Elevation$e4 = _debois$elm_mdl$Material_Elevation$shadow(4);
var _debois$elm_mdl$Material_Elevation$e6 = _debois$elm_mdl$Material_Elevation$shadow(6);
var _debois$elm_mdl$Material_Elevation$e8 = _debois$elm_mdl$Material_Elevation$shadow(8);
var _debois$elm_mdl$Material_Elevation$e16 = _debois$elm_mdl$Material_Elevation$shadow(16);
var _debois$elm_mdl$Material_Elevation$e24 = _debois$elm_mdl$Material_Elevation$shadow(24);
var _debois$elm_mdl$Material_Elevation$elevations = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e0, _1: 0},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e2, _1: 2},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e3, _1: 3},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e4, _1: 4},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e6, _1: 6},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e8, _1: 8},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e16, _1: 16},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: _debois$elm_mdl$Material_Elevation$e24, _1: 24},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	});

var _debois$elm_mdl$Material_Grid$clip = F3(
	function (lower, upper, k) {
		return A2(
			_elm_lang$core$Basics$max,
			lower,
			A2(_elm_lang$core$Basics$min, k, upper));
	});
var _debois$elm_mdl$Material_Grid$stretch = _debois$elm_mdl$Material_Options$cs('mdl-cell--stretch');
var _debois$elm_mdl$Material_Grid$align = function (a) {
	var _p0 = a;
	switch (_p0.ctor) {
		case 'Top':
			return _debois$elm_mdl$Material_Options$cs('mdl-cell--top');
		case 'Middle':
			return _debois$elm_mdl$Material_Options$cs('mdl-cell--middle');
		default:
			return _debois$elm_mdl$Material_Options$cs('mdl-cell--bottom');
	}
};
var _debois$elm_mdl$Material_Grid$suffix = function (device) {
	var _p1 = device;
	switch (_p1.ctor) {
		case 'All':
			return '';
		case 'Desktop':
			return '-desktop';
		case 'Tablet':
			return '-tablet';
		default:
			return '-phone';
	}
};
var _debois$elm_mdl$Material_Grid$size = F2(
	function (device, k) {
		var c = function () {
			var _p2 = device;
			switch (_p2.ctor) {
				case 'All':
					return A3(_debois$elm_mdl$Material_Grid$clip, 1, 12, k);
				case 'Desktop':
					return A3(_debois$elm_mdl$Material_Grid$clip, 1, 12, k);
				case 'Tablet':
					return A3(_debois$elm_mdl$Material_Grid$clip, 1, 8, k);
				default:
					return A3(_debois$elm_mdl$Material_Grid$clip, 1, 4, k);
			}
		}();
		return _debois$elm_mdl$Material_Options$cs(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'mdl-cell--',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(c),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-col',
						_debois$elm_mdl$Material_Grid$suffix(device)))));
	});
var _debois$elm_mdl$Material_Grid$offset = F2(
	function (device, k) {
		var c = function () {
			var _p3 = device;
			switch (_p3.ctor) {
				case 'All':
					return A3(_debois$elm_mdl$Material_Grid$clip, 0, 11, k);
				case 'Desktop':
					return A3(_debois$elm_mdl$Material_Grid$clip, 0, 11, k);
				case 'Tablet':
					return A3(_debois$elm_mdl$Material_Grid$clip, 0, 7, k);
				default:
					return A3(_debois$elm_mdl$Material_Grid$clip, 0, 3, k);
			}
		}();
		return _debois$elm_mdl$Material_Options$cs(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'mdl-cell--',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(c),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-offset',
						_debois$elm_mdl$Material_Grid$suffix(device)))));
	});
var _debois$elm_mdl$Material_Grid$hide = function (device) {
	return _debois$elm_mdl$Material_Options$cs(
		function () {
			var _p4 = device;
			if (_p4.ctor === 'All') {
				return '';
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'mdl-cell--hide',
					_debois$elm_mdl$Material_Grid$suffix(device));
			}
		}());
};
var _debois$elm_mdl$Material_Grid$order = F2(
	function (device, n) {
		return _debois$elm_mdl$Material_Options$cs(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'mdl-cell--order-',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						A3(_debois$elm_mdl$Material_Grid$clip, 1, 12, n)),
					_debois$elm_mdl$Material_Grid$suffix(device))));
	});
var _debois$elm_mdl$Material_Grid$grid = F2(
	function (styling, cells) {
		return A2(
			_debois$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-grid'),
				_1: styling
			},
			A2(
				_elm_lang$core$List$map,
				function (_p5) {
					var _p6 = _p5;
					return _p6._0;
				},
				cells));
	});
var _debois$elm_mdl$Material_Grid$maxWidth = function (w) {
	return A2(_debois$elm_mdl$Material_Options$css, 'max-width', w);
};
var _debois$elm_mdl$Material_Grid$noSpacing = _debois$elm_mdl$Material_Options$cs('mdl-grid--no-spacing');
var _debois$elm_mdl$Material_Grid$Phone = {ctor: 'Phone'};
var _debois$elm_mdl$Material_Grid$Tablet = {ctor: 'Tablet'};
var _debois$elm_mdl$Material_Grid$Desktop = {ctor: 'Desktop'};
var _debois$elm_mdl$Material_Grid$All = {ctor: 'All'};
var _debois$elm_mdl$Material_Grid$Cell = function (a) {
	return {ctor: 'Cell', _0: a};
};
var _debois$elm_mdl$Material_Grid$cell = F2(
	function (styling, elms) {
		return _debois$elm_mdl$Material_Grid$Cell(
			A2(
				_debois$elm_mdl$Material_Options$div,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-cell'),
					_1: styling
				},
				elms));
	});
var _debois$elm_mdl$Material_Grid$Bottom = {ctor: 'Bottom'};
var _debois$elm_mdl$Material_Grid$Middle = {ctor: 'Middle'};
var _debois$elm_mdl$Material_Grid$Top = {ctor: 'Top'};

var _debois$elm_mdl$Material_List$action2 = _debois$elm_mdl$Material_Options$cs('mdl-list__item-secondary-action');
var _debois$elm_mdl$Material_List$info2 = function (options) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-secondary-info'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$content2 = function (options) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-secondary-content'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$subtitle = function (options) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-sub-title'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$body = function (options) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-text-body'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$icon = F2(
	function (i, options) {
		return A2(
			_debois$elm_mdl$Material_Icon$view,
			i,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-icon'),
				_1: options
			});
	});
var _debois$elm_mdl$Material_List$avatar = _debois$elm_mdl$Material_Options$cs('mdl-list__item-avatar');
var _debois$elm_mdl$Material_List$avatarImage = F2(
	function (src, options) {
		return A4(
			_debois$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			{ctor: '::', _0: _debois$elm_mdl$Material_List$avatar, _1: options},
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$src(src),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _debois$elm_mdl$Material_List$avatarIcon = F2(
	function (i, options) {
		return A2(
			_debois$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$center,
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$many(options),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_List$avatar,
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Icon$i(i),
				_1: {ctor: '[]'}
			});
	});
var _debois$elm_mdl$Material_List$content = function (options) {
	return _debois$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item-primary-content'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$withSubtitle = _debois$elm_mdl$Material_Options$cs('mdl-list__item--two-line');
var _debois$elm_mdl$Material_List$withBody = _debois$elm_mdl$Material_Options$cs('mdl-list__item--three-line');
var _debois$elm_mdl$Material_List$li = function (options) {
	return A2(
		_debois$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list__item'),
			_1: options
		});
};
var _debois$elm_mdl$Material_List$ul = function (options) {
	return A2(
		_debois$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$ul,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-list'),
			_1: options
		});
};

var _debois$elm_mdl$Material_Spinner$layer = function (n) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'mdl-spinner__layer mdl-spinner__layer-',
					_elm_lang$core$Basics$toString(n))),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$List$map,
			F2(
				function (x, y) {
					return y(x);
				})(
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-spinner__circle'),
							_1: {ctor: '[]'}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}),
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$div(
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('mdl-spinner__circle-clipper mdl-spinner__left'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$div(
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$cs('mdl-spinner__gap-patch'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$div(
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$cs('mdl-spinner__circle-clipper mdl-spinner__right'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}));
};
var _debois$elm_mdl$Material_Spinner$layers = A2(
	_elm_lang$core$List$map,
	_debois$elm_mdl$Material_Spinner$layer,
	A2(_elm_lang$core$List$range, 1, 4));
var _debois$elm_mdl$Material_Spinner$defaultConfig = {active: false, singleColor: false};
var _debois$elm_mdl$Material_Spinner$singleColor = function (_p0) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{singleColor: value});
			})(_p0));
};
var _debois$elm_mdl$Material_Spinner$active = function (_p1) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{active: value});
			})(_p1));
};
var _debois$elm_mdl$Material_Spinner$spinner = function (options) {
	var _p2 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Spinner$defaultConfig, options);
	var summary = _p2;
	var config = _p2.config;
	return A5(
		_debois$elm_mdl$Material_Options_Internal$apply,
		summary,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$cs('mdl-spinner mdl-js-spinner is-upgraded'),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$when,
					config.active,
					_debois$elm_mdl$Material_Options$cs('is-active')),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						config.singleColor,
						_debois$elm_mdl$Material_Options$cs('mdl-spinner--single-color')),
					_1: {ctor: '[]'}
				}
			}
		},
		{ctor: '[]'},
		_debois$elm_mdl$Material_Spinner$layers);
};
var _debois$elm_mdl$Material_Spinner$Config = F2(
	function (a, b) {
		return {active: a, singleColor: b};
	});

var _debois$elm_mdl$Material_Table$defaultCell = {numeric: false};
var _debois$elm_mdl$Material_Table$td = F2(
	function (options, html) {
		var _p0 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Table$defaultCell, options);
		var summary = _p0;
		var config = _p0.config;
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$td,
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$when,
					!config.numeric,
					_debois$elm_mdl$Material_Options$cs('mdl-data-table__cell--non-numeric')),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$sorted = function (order) {
	return _debois$elm_mdl$Material_Options_Internal$option(
		function (self) {
			return _elm_lang$core$Native_Utils.update(
				self,
				{
					sorted: _elm_lang$core$Maybe$Just(order)
				});
		});
};
var _debois$elm_mdl$Material_Table$numeric = _debois$elm_mdl$Material_Options_Internal$option(
	function (self) {
		return _elm_lang$core$Native_Utils.update(
			self,
			{numeric: true});
	});
var _debois$elm_mdl$Material_Table$defaultHeader = {numeric: false, sorted: _elm_lang$core$Maybe$Nothing};
var _debois$elm_mdl$Material_Table$th = F2(
	function (options, html) {
		var _p1 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Table$defaultHeader, options);
		var summary = _p1;
		var config = _p1.config;
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$th,
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$when,
					!config.numeric,
					_debois$elm_mdl$Material_Options$cs('mdl-data-table__cell--non-numeric')),
				_1: {
					ctor: '::',
					_0: function () {
						var _p2 = config.sorted;
						if (_p2.ctor === 'Just') {
							if (_p2._0.ctor === 'Ascending') {
								return _debois$elm_mdl$Material_Options$cs('mdl-data-table__header--sorted-ascending');
							} else {
								return _debois$elm_mdl$Material_Options$cs('mdl-data-table__header--sorted-descending');
							}
						} else {
							return _debois$elm_mdl$Material_Options$nop;
						}
					}(),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$selected = _debois$elm_mdl$Material_Options_Internal$option(
	function (self) {
		return _elm_lang$core$Native_Utils.update(
			self,
			{selected: true});
	});
var _debois$elm_mdl$Material_Table$defaultRow = {selected: false};
var _debois$elm_mdl$Material_Table$tr = F2(
	function (options, html) {
		var _p3 = A2(_debois$elm_mdl$Material_Options_Internal$collect, _debois$elm_mdl$Material_Table$defaultRow, options);
		var summary = _p3;
		var config = _p3.config;
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$tr,
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$when,
					config.selected,
					_debois$elm_mdl$Material_Options$cs('is-selected')),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$tfoot = F2(
	function (options, html) {
		var summary = A2(
			_debois$elm_mdl$Material_Options_Internal$collect,
			{},
			options);
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$tfoot,
			{ctor: '[]'},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$tbody = F2(
	function (options, html) {
		var summary = A2(
			_debois$elm_mdl$Material_Options_Internal$collect,
			{},
			options);
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$tbody,
			{ctor: '[]'},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$thead = F2(
	function (options, html) {
		var summary = A2(
			_debois$elm_mdl$Material_Options_Internal$collect,
			{},
			options);
		return A5(
			_debois$elm_mdl$Material_Options_Internal$apply,
			summary,
			_elm_lang$html$Html$thead,
			{ctor: '[]'},
			{ctor: '[]'},
			html);
	});
var _debois$elm_mdl$Material_Table$table = F2(
	function (options, nodes) {
		return A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$table,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$cs('mdl-data-table'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$cs('mdl-js-data-table'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: options
					}
				}
			},
			nodes);
	});
var _debois$elm_mdl$Material_Table$Row = function (a) {
	return {selected: a};
};
var _debois$elm_mdl$Material_Table$Header = F2(
	function (a, b) {
		return {numeric: a, sorted: b};
	});
var _debois$elm_mdl$Material_Table$Cell = function (a) {
	return {numeric: a};
};
var _debois$elm_mdl$Material_Table$Descending = {ctor: 'Descending'};
var _debois$elm_mdl$Material_Table$descending = _debois$elm_mdl$Material_Table$sorted(_debois$elm_mdl$Material_Table$Descending);
var _debois$elm_mdl$Material_Table$Ascending = {ctor: 'Ascending'};
var _debois$elm_mdl$Material_Table$ascending = _debois$elm_mdl$Material_Table$sorted(_debois$elm_mdl$Material_Table$Ascending);

var _debois$elm_mdl$Material_Typography$uppercase = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-uppercase');
var _debois$elm_mdl$Material_Typography$lowercase = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-lowercase');
var _debois$elm_mdl$Material_Typography$capitalize = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-capitalize');
var _debois$elm_mdl$Material_Typography$justify = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-justify');
var _debois$elm_mdl$Material_Typography$right = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-right');
var _debois$elm_mdl$Material_Typography$left = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-left');
var _debois$elm_mdl$Material_Typography$center = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-center');
var _debois$elm_mdl$Material_Typography$tableStriped = _debois$elm_mdl$Material_Options$cs('mdl-typography--table-striped');
var _debois$elm_mdl$Material_Typography$nowrap = _debois$elm_mdl$Material_Options$cs('mdl-typography--text-nowrap');
var _debois$elm_mdl$Material_Typography$contrast = function (x) {
	return A2(
		_debois$elm_mdl$Material_Options$css,
		'opacity',
		_elm_lang$core$Basics$toString(x));
};
var _debois$elm_mdl$Material_Typography$menu = _debois$elm_mdl$Material_Options$cs('mdl-typography--menu-color-contrast');
var _debois$elm_mdl$Material_Typography$button = _debois$elm_mdl$Material_Options$cs('mdl-typography--button-color-contrast');
var _debois$elm_mdl$Material_Typography$caption = _debois$elm_mdl$Material_Options$cs('mdl-typography--caption-force-preferred-font-color-contrast');
var _debois$elm_mdl$Material_Typography$body2 = _debois$elm_mdl$Material_Options$cs('mdl-typography--body-2-force-preferred-font-color-contrast');
var _debois$elm_mdl$Material_Typography$body1 = _debois$elm_mdl$Material_Options$cs('mdl-typography--body-1-force-preferred-font-color-contrast');
var _debois$elm_mdl$Material_Typography$subhead = _debois$elm_mdl$Material_Options$cs('mdl-typography--subhead-color-contrast');
var _debois$elm_mdl$Material_Typography$title = _debois$elm_mdl$Material_Options$cs('mdl-typography--title-color-contrast');
var _debois$elm_mdl$Material_Typography$headline = _debois$elm_mdl$Material_Options$cs('mdl-typography--headline-color-contrast');
var _debois$elm_mdl$Material_Typography$display4 = _debois$elm_mdl$Material_Options$cs('mdl-typography--display-4-color-contrast');
var _debois$elm_mdl$Material_Typography$display3 = _debois$elm_mdl$Material_Options$cs('mdl-typography--display-3-color-contrast');
var _debois$elm_mdl$Material_Typography$display2 = _debois$elm_mdl$Material_Options$cs('mdl-typography--display-2-color-contrast');
var _debois$elm_mdl$Material_Typography$display1 = _debois$elm_mdl$Material_Options$cs('mdl-typography--display-1-color-contrast');

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _egvelho$cibertexto_website_elm$Types$Pages = F4(
	function (a, b, c, d) {
		return {home: a, techSupport: b, schedule: c, order: d};
	});
var _egvelho$cibertexto_website_elm$Types$HomeModel = function (a) {
	return {banner: a};
};
var _egvelho$cibertexto_website_elm$Types$TechSupportModel = F5(
	function (a, b, c, d, e) {
		return {option: a, toggleFormatWithBackup: b, toggleStartupProblem: c, toggleBackupOption: d, urgency: e};
	});
var _egvelho$cibertexto_website_elm$Types$ScheduleModel = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return {order: a, scheduling: b, scheduleLoading: c, scheduleLoadError: d, place: e, name: f, phone: g, address: h, obs: i, day: j, time: k, resultLoading: l, result: m};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _egvelho$cibertexto_website_elm$Types$OrderModel = F3(
	function (a, b, c) {
		return {loadingOrder: a, id: b, result: c};
	});
var _egvelho$cibertexto_website_elm$Types$SendOrder = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {option: a, urgency: b, withBackup: c, problem: d, backupOption: e, name: f, phone: g, obs: h, place: i, address: j, year: k, month: l, monthday: m, hour: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _egvelho$cibertexto_website_elm$Types$RequestResult = F2(
	function (a, b) {
		return {status: a, order: b};
	});
var _egvelho$cibertexto_website_elm$Types$OrderResult = F2(
	function (a, b) {
		return {status: a, order: b};
	});
var _egvelho$cibertexto_website_elm$Types$OrderItem = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return {id: a, status: b, option: c, urgency: d, withBackup: e, problem: f, backupOption: g, name: h, phone: i, obs: j, place: k, address: l, price: m, delivery: n, date: o};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _egvelho$cibertexto_website_elm$Types$OrderItemDate = F5(
	function (a, b, c, d, e) {
		return {year: a, month: b, weekday: c, monthday: d, hour: e};
	});
var _egvelho$cibertexto_website_elm$Types$Model = F4(
	function (a, b, c, d) {
		return {mdl: a, viewport: b, currentPage: c, pages: d};
	});
var _egvelho$cibertexto_website_elm$Types$DayScheduling = F5(
	function (a, b, c, d, e) {
		return {hours: a, monthday: b, weekday: c, month: d, year: e};
	});
var _egvelho$cibertexto_website_elm$Types$HelpOrder = {ctor: 'HelpOrder'};
var _egvelho$cibertexto_website_elm$Types$VirusOrder = {ctor: 'VirusOrder'};
var _egvelho$cibertexto_website_elm$Types$BackupOrder = {ctor: 'BackupOrder'};
var _egvelho$cibertexto_website_elm$Types$NewProgramOrder = {ctor: 'NewProgramOrder'};
var _egvelho$cibertexto_website_elm$Types$SlowProblemOrder = {ctor: 'SlowProblemOrder'};
var _egvelho$cibertexto_website_elm$Types$LostFilesOrder = {ctor: 'LostFilesOrder'};
var _egvelho$cibertexto_website_elm$Types$StartupProblemOrder = {ctor: 'StartupProblemOrder'};
var _egvelho$cibertexto_website_elm$Types$TrollProgramOrder = {ctor: 'TrollProgramOrder'};
var _egvelho$cibertexto_website_elm$Types$ProgramProblemOrder = {ctor: 'ProgramProblemOrder'};
var _egvelho$cibertexto_website_elm$Types$FormatOrder = {ctor: 'FormatOrder'};
var _egvelho$cibertexto_website_elm$Types$LawyerOrder = {ctor: 'LawyerOrder'};
var _egvelho$cibertexto_website_elm$Types$DevelopmentOrder = {ctor: 'DevelopmentOrder'};
var _egvelho$cibertexto_website_elm$Types$Schedule = {ctor: 'Schedule'};
var _egvelho$cibertexto_website_elm$Types$About = {ctor: 'About'};
var _egvelho$cibertexto_website_elm$Types$Development = {ctor: 'Development'};
var _egvelho$cibertexto_website_elm$Types$Lawyers = {ctor: 'Lawyers'};
var _egvelho$cibertexto_website_elm$Types$Order = {ctor: 'Order'};
var _egvelho$cibertexto_website_elm$Types$TechSupport = {ctor: 'TechSupport'};
var _egvelho$cibertexto_website_elm$Types$Home = {ctor: 'Home'};
var _egvelho$cibertexto_website_elm$Types$Desktop = {ctor: 'Desktop'};
var _egvelho$cibertexto_website_elm$Types$Tablet = {ctor: 'Tablet'};
var _egvelho$cibertexto_website_elm$Types$Phone = {ctor: 'Phone'};
var _egvelho$cibertexto_website_elm$Types$RestartOrderPage = {ctor: 'RestartOrderPage'};
var _egvelho$cibertexto_website_elm$Types$LoadOrderOrderPage = function (a) {
	return {ctor: 'LoadOrderOrderPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$RequestOrderOrderPage = function (a) {
	return {ctor: 'RequestOrderOrderPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$SendOrderSchedulePage = {ctor: 'SendOrderSchedulePage'};
var _egvelho$cibertexto_website_elm$Types$PostSchedulingSchedulePage = function (a) {
	return {ctor: 'PostSchedulingSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$SelectTimeSchedulePage = function (a) {
	return {ctor: 'SelectTimeSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$SelectDaySchedulePage = function (a) {
	return {ctor: 'SelectDaySchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$LoadSchedulingSchedulePage = {ctor: 'LoadSchedulingSchedulePage'};
var _egvelho$cibertexto_website_elm$Types$RequestSchedulingSchedulePage = function (a) {
	return {ctor: 'RequestSchedulingSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdateObsSchedulePage = function (a) {
	return {ctor: 'UpdateObsSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdateAddressSchedulePage = function (a) {
	return {ctor: 'UpdateAddressSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdatePhoneSchedulePage = function (a) {
	return {ctor: 'UpdatePhoneSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdateNameSchedulePage = function (a) {
	return {ctor: 'UpdateNameSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$TogglePlaceSchedulePage = function (a) {
	return {ctor: 'TogglePlaceSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$SelectOrderSchedulePage = function (a) {
	return {ctor: 'SelectOrderSchedulePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$ToggleBackupOptionTechSupportPage = function (a) {
	return {ctor: 'ToggleBackupOptionTechSupportPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage = {ctor: 'ToggleUrgencyTechSupportPage'};
var _egvelho$cibertexto_website_elm$Types$ToggleStartupProblemTechSupportPage = function (a) {
	return {ctor: 'ToggleStartupProblemTechSupportPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$ToggleFormatBackupTechSupportPage = function (a) {
	return {ctor: 'ToggleFormatBackupTechSupportPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$SelectOptionTechSupportPage = function (a) {
	return {ctor: 'SelectOptionTechSupportPage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdateBannerHomePage = function (a) {
	return {ctor: 'UpdateBannerHomePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$ChangeBannerHomePage = function (a) {
	return {ctor: 'ChangeBannerHomePage', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$ScrollToTop = {ctor: 'ScrollToTop'};
var _egvelho$cibertexto_website_elm$Types$ClickDrawerItem = function (a) {
	return {ctor: 'ClickDrawerItem', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$UpdateViewport = function (a) {
	return {ctor: 'UpdateViewport', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$LinkTo = function (a) {
	return {ctor: 'LinkTo', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$GoTo = function (a) {
	return {ctor: 'GoTo', _0: a};
};
var _egvelho$cibertexto_website_elm$Types$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};

var _egvelho$cibertexto_website_elm$Generics$onClickPreventDefault = function (msg) {
	return A3(
		_debois$elm_mdl$Material_Options$onWithOptions,
		'click',
		{preventDefault: true, stopPropagation: false},
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _egvelho$cibertexto_website_elm$Generics$weekdayToString = function (day_) {
	var _p0 = day_;
	switch (_p0) {
		case 1:
			return 'Segunda';
		case 2:
			return 'Terça';
		case 3:
			return 'Quarta';
		case 4:
			return 'Quinta';
		case 5:
			return 'Sexta';
		default:
			return 'Dia inválido';
	}
};
var _egvelho$cibertexto_website_elm$Generics$monthToString = function (month_) {
	var _p1 = month_;
	switch (_p1) {
		case 1:
			return 'Janeiro';
		case 2:
			return 'Fevereiro';
		case 3:
			return 'Março';
		case 4:
			return 'Abril';
		case 5:
			return 'Maio';
		case 6:
			return 'Junho';
		case 7:
			return 'Julho';
		case 8:
			return 'Agosto';
		case 9:
			return 'Setembro';
		case 10:
			return 'Outubro';
		case 11:
			return 'Novembro';
		case 12:
			return 'Dezembro';
		default:
			return 'Mês inválido';
	}
};

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _egvelho$cibertexto_website_elm$Route$linkTo = function (url_) {
	return _egvelho$cibertexto_website_elm$Generics$onClickPreventDefault(
		_egvelho$cibertexto_website_elm$Types$LinkTo(url_));
};
var _egvelho$cibertexto_website_elm$Route$lookFor = function (location) {
	var _p0 = A2(_elm_lang$core$Debug$log, 'teste_', location);
	var _p1 = location.hash;
	switch (_p1) {
		case '#/home':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Home);
		case '#/assistencia':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$TechSupport);
		case '#/andamento':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Order);
		case '#/dev':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Development);
		case '#/advogados':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Lawyers);
		case '#/sobre':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$About);
		case '#/agendamento':
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Schedule);
		default:
			return _egvelho$cibertexto_website_elm$Types$GoTo(_egvelho$cibertexto_website_elm$Types$Home);
	}
};

var _egvelho$cibertexto_website_elm$Requests$encodeOrder = function (order_) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'option',
					_1: _elm_lang$core$Json_Encode$string(order_.option)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'urgency',
						_1: _elm_lang$core$Json_Encode$bool(order_.urgency)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'withBackup',
							_1: _elm_lang$core$Json_Encode$bool(order_.withBackup)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'problem',
								_1: _elm_lang$core$Json_Encode$int(order_.problem)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'backupOption',
									_1: _elm_lang$core$Json_Encode$int(order_.backupOption)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'name',
										_1: _elm_lang$core$Json_Encode$string(order_.name)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'phone',
											_1: _elm_lang$core$Json_Encode$string(order_.phone)
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'obs',
												_1: _elm_lang$core$Json_Encode$string(order_.obs)
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'place',
													_1: _elm_lang$core$Json_Encode$string(order_.place)
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: 'address',
														_1: _elm_lang$core$Json_Encode$string(order_.address)
													},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'year',
															_1: _elm_lang$core$Json_Encode$int(order_.year)
														},
														_1: {
															ctor: '::',
															_0: {
																ctor: '_Tuple2',
																_0: 'month',
																_1: _elm_lang$core$Json_Encode$int(order_.month)
															},
															_1: {
																ctor: '::',
																_0: {
																	ctor: '_Tuple2',
																	_0: 'monthday',
																	_1: _elm_lang$core$Json_Encode$int(order_.monthday)
																},
																_1: {
																	ctor: '::',
																	_0: {
																		ctor: '_Tuple2',
																		_0: 'hour',
																		_1: _elm_lang$core$Json_Encode$int(order_.hour)
																	},
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}));
};
var _egvelho$cibertexto_website_elm$Requests$orderDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'date',
	A6(
		_elm_lang$core$Json_Decode$map5,
		_egvelho$cibertexto_website_elm$Types$OrderItemDate,
		A2(_elm_lang$core$Json_Decode$field, 'year', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'month', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'weekday', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'monthday', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'hour', _elm_lang$core$Json_Decode$int)),
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'delivery',
		_elm_lang$core$Json_Decode$int,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'price',
			_elm_lang$core$Json_Decode$int,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'address',
				_elm_lang$core$Json_Decode$string,
				A3(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
					'place',
					_elm_lang$core$Json_Decode$string,
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'obs',
						_elm_lang$core$Json_Decode$string,
						A3(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
							'phone',
							_elm_lang$core$Json_Decode$string,
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'name',
								_elm_lang$core$Json_Decode$string,
								A3(
									_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
									'backupOption',
									_elm_lang$core$Json_Decode$int,
									A3(
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
										'problem',
										_elm_lang$core$Json_Decode$int,
										A3(
											_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
											'withBackup',
											_elm_lang$core$Json_Decode$bool,
											A3(
												_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
												'urgency',
												_elm_lang$core$Json_Decode$bool,
												A3(
													_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
													'option',
													_elm_lang$core$Json_Decode$string,
													A3(
														_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
														'status',
														_elm_lang$core$Json_Decode$string,
														A3(
															_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
															'id',
															_elm_lang$core$Json_Decode$string,
															_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_egvelho$cibertexto_website_elm$Types$OrderItem))))))))))))))));
var _egvelho$cibertexto_website_elm$Requests$getOrder = function (id_) {
	var url = A2(_elm_lang$core$Basics_ops['++'], 'https://api.example.com/schedule/', id_);
	return A2(
		_elm_lang$http$Http$send,
		_egvelho$cibertexto_website_elm$Types$RequestOrderOrderPage,
		A2(
			_elm_lang$http$Http$get,
			url,
			A3(
				_elm_lang$core$Json_Decode$map2,
				_egvelho$cibertexto_website_elm$Types$OrderResult,
				A2(_elm_lang$core$Json_Decode$field, 'status', _elm_lang$core$Json_Decode$string),
				A2(_elm_lang$core$Json_Decode$field, 'order', _egvelho$cibertexto_website_elm$Requests$orderDecoder))));
};
var _egvelho$cibertexto_website_elm$Requests$resultDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_egvelho$cibertexto_website_elm$Types$RequestResult,
	A2(_elm_lang$core$Json_Decode$field, 'status', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'order', _elm_lang$core$Json_Decode$string));
var _egvelho$cibertexto_website_elm$Requests$postOrder = function (order_) {
	var url_ = 'https://api.example.com/schedule';
	return A2(
		_elm_lang$http$Http$send,
		_egvelho$cibertexto_website_elm$Types$PostSchedulingSchedulePage,
		A3(
			_elm_lang$http$Http$post,
			url_,
			A2(
				_elm_lang$http$Http$stringBody,
				'application/json',
				_egvelho$cibertexto_website_elm$Requests$encodeOrder(order_)),
			_egvelho$cibertexto_website_elm$Requests$resultDecoder));
};
var _egvelho$cibertexto_website_elm$Requests$scheduleDecoder = _elm_lang$core$Json_Decode$list(
	A6(
		_elm_lang$core$Json_Decode$map5,
		_egvelho$cibertexto_website_elm$Types$DayScheduling,
		A2(
			_elm_lang$core$Json_Decode$field,
			'hours',
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$int)),
		A2(_elm_lang$core$Json_Decode$field, 'monthday', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'weekday', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'month', _elm_lang$core$Json_Decode$int),
		A2(_elm_lang$core$Json_Decode$field, 'year', _elm_lang$core$Json_Decode$int)));
var _egvelho$cibertexto_website_elm$Requests$getScheduling = function () {
	var url = 'https://api.example.com/schedule';
	return A2(
		_elm_lang$http$Http$send,
		_egvelho$cibertexto_website_elm$Types$RequestSchedulingSchedulePage,
		A2(_elm_lang$http$Http$get, url, _egvelho$cibertexto_website_elm$Requests$scheduleDecoder));
}();

var _egvelho$cibertexto_website_elm$Model$model = {
	mdl: _debois$elm_mdl$Material$model,
	viewport: _egvelho$cibertexto_website_elm$Types$Tablet,
	currentPage: _egvelho$cibertexto_website_elm$Types$Home,
	pages: {
		home: {banner: 0},
		techSupport: {option: 'main', toggleFormatWithBackup: false, toggleStartupProblem: 0, toggleBackupOption: 0, urgency: false},
		schedule: {
			order: _egvelho$cibertexto_website_elm$Types$HelpOrder,
			scheduling: {ctor: '[]'},
			scheduleLoading: false,
			scheduleLoadError: false,
			place: 0,
			name: '',
			phone: '',
			address: '',
			obs: '',
			day: A5(
				_egvelho$cibertexto_website_elm$Types$DayScheduling,
				{ctor: '[]'},
				0,
				0,
				0,
				0),
			time: 0,
			resultLoading: false,
			result: A2(_egvelho$cibertexto_website_elm$Types$RequestResult, '', '')
		},
		order: {
			loadingOrder: false,
			id: '',
			result: A2(
				_egvelho$cibertexto_website_elm$Types$OrderResult,
				'',
				_egvelho$cibertexto_website_elm$Types$OrderItem('')('')('')(false)(false)(0)(0)('')('')('')('')('')(0)(0)(
					A5(_egvelho$cibertexto_website_elm$Types$OrderItemDate, 0, 0, 0, 0, 0)))
		}
	}
};
var _egvelho$cibertexto_website_elm$Model$init = function (location) {
	var page = function () {
		var _p0 = location.hash;
		switch (_p0) {
			case '#/home':
				return _egvelho$cibertexto_website_elm$Types$Home;
			case '#/assistencia':
				return _egvelho$cibertexto_website_elm$Types$TechSupport;
			case '#/andamento':
				return _egvelho$cibertexto_website_elm$Types$Order;
			case '#/advogados':
				return _egvelho$cibertexto_website_elm$Types$Lawyers;
			case '#/dev':
				return _egvelho$cibertexto_website_elm$Types$Development;
			case '#/sobre':
				return _egvelho$cibertexto_website_elm$Types$About;
			case '#/agendamento':
				return _egvelho$cibertexto_website_elm$Types$Home;
			default:
				return _egvelho$cibertexto_website_elm$Types$Home;
		}
	}();
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			_egvelho$cibertexto_website_elm$Model$model,
			{currentPage: page}),
		_1: _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material$init(_egvelho$cibertexto_website_elm$Types$Mdl),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Task$perform, _egvelho$cibertexto_website_elm$Types$UpdateViewport, _elm_lang$window$Window$size),
					_1: {ctor: '[]'}
				}
			})
	};
};

var _egvelho$cibertexto_website_elm$Ports$scrollTop = _elm_lang$core$Native_Platform.outgoingPort(
	'scrollTop',
	function (v) {
		return null;
	});

var _egvelho$cibertexto_website_elm$Update$update = F2(
	function (msg, model) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'Mdl':
				return A3(_debois$elm_mdl$Material$update, _egvelho$cibertexto_website_elm$Types$Mdl, _p0._0, model);
			case 'GoTo':
				var _p2 = _p0._0;
				if (_elm_lang$core$Native_Utils.eq(_p2, _egvelho$cibertexto_website_elm$Types$Schedule)) {
					var schedulePage = model.pages.schedule;
					var pages_ = model.pages;
					var _p1 = A2(_elm_lang$core$Debug$log, 'teste2', _p2);
					var schedulePage0 = _elm_lang$core$Native_Utils.update(
						schedulePage,
						{
							scheduling: {ctor: '[]'}
						});
					var schedulePage1 = _elm_lang$core$Native_Utils.update(
						schedulePage0,
						{scheduleLoadError: false});
					var schedulePage2 = _elm_lang$core$Native_Utils.update(
						schedulePage1,
						{place: 0});
					var schedulePage3 = _elm_lang$core$Native_Utils.update(
						schedulePage2,
						{name: ''});
					var schedulePage4 = _elm_lang$core$Native_Utils.update(
						schedulePage3,
						{phone: ''});
					var schedulePage5 = _elm_lang$core$Native_Utils.update(
						schedulePage4,
						{address: ''});
					var schedulePage6 = _elm_lang$core$Native_Utils.update(
						schedulePage5,
						{obs: ''});
					var schedulePage7 = _elm_lang$core$Native_Utils.update(
						schedulePage6,
						{
							day: A5(
								_egvelho$cibertexto_website_elm$Types$DayScheduling,
								{ctor: '[]'},
								0,
								0,
								0,
								0)
						});
					var schedulePage8 = _elm_lang$core$Native_Utils.update(
						schedulePage7,
						{time: 0});
					var schedulePage9 = _elm_lang$core$Native_Utils.update(
						schedulePage8,
						{
							result: A2(_egvelho$cibertexto_website_elm$Types$RequestResult, '', '')
						});
					var model_ = _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage9,
										{scheduleLoading: true})
								})
						});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model_,
							{currentPage: _p2}),
						_1: _elm_lang$core$Platform_Cmd$batch(
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Requests$getScheduling,
								_1: {
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Ports$scrollTop(
										{ctor: '_Tuple0'}),
									_1: {ctor: '[]'}
								}
							})
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{currentPage: _p2}),
						_1: _egvelho$cibertexto_website_elm$Ports$scrollTop(
							{ctor: '_Tuple0'})
					};
				}
			case 'LinkTo':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(_p0._0)
				};
			case 'UpdateViewport':
				var _p3 = _p0._0;
				var viewport_ = (_elm_lang$core$Native_Utils.cmp(_p3.width, 840) > -1) ? _egvelho$cibertexto_website_elm$Types$Desktop : ((_elm_lang$core$Native_Utils.cmp(_p3.width, 480) > -1) ? _egvelho$cibertexto_website_elm$Types$Tablet : _egvelho$cibertexto_website_elm$Types$Phone);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{viewport: viewport_}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ClickDrawerItem':
				var layout = model.mdl.layout;
				var mdl_ = model.mdl;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							mdl: _elm_lang$core$Native_Utils.update(
								mdl_,
								{
									layout: _elm_lang$core$Native_Utils.update(
										layout,
										{isDrawerOpen: false})
								})
						}),
					_1: _elm_lang$navigation$Navigation$newUrl(_p0._0)
				};
			case 'ScrollToTop':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _egvelho$cibertexto_website_elm$Ports$scrollTop(
						{ctor: '_Tuple0'})
				};
			case 'ChangeBannerHomePage':
				var homePage = model.pages.home;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									home: _elm_lang$core$Native_Utils.update(
										homePage,
										{banner: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'UpdateBannerHomePage':
				var homePage = model.pages.home;
				var index = (_elm_lang$core$Native_Utils.cmp(homePage.banner, 4) > -1) ? 0 : (homePage.banner + 1);
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									home: _elm_lang$core$Native_Utils.update(
										homePage,
										{banner: index})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SelectOptionTechSupportPage':
				var techSupportPage = model.pages.techSupport;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									techSupport: _elm_lang$core$Native_Utils.update(
										techSupportPage,
										{option: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ToggleFormatBackupTechSupportPage':
				var techSupportPage = model.pages.techSupport;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									techSupport: _elm_lang$core$Native_Utils.update(
										techSupportPage,
										{toggleFormatWithBackup: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ToggleUrgencyTechSupportPage':
				var techSupportPage = model.pages.techSupport;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									techSupport: _elm_lang$core$Native_Utils.update(
										techSupportPage,
										{urgency: !model.pages.techSupport.urgency})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ToggleStartupProblemTechSupportPage':
				var techSupportPage = model.pages.techSupport;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									techSupport: _elm_lang$core$Native_Utils.update(
										techSupportPage,
										{toggleStartupProblem: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ToggleBackupOptionTechSupportPage':
				var techSupportPage = model.pages.techSupport;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									techSupport: _elm_lang$core$Native_Utils.update(
										techSupportPage,
										{toggleBackupOption: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SelectOrderSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{order: _p0._0})
								})
						}),
					_1: _elm_lang$navigation$Navigation$newUrl('#/agendamento')
				};
			case 'TogglePlaceSchedulePage':
				var _p5 = _p0._0;
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				var schedulePage_ = _elm_lang$core$Native_Utils.update(
					schedulePage,
					{
						address: function () {
							var _p4 = _p5;
							switch (_p4) {
								case 0:
									return 'Endereço A';
								case 1:
									return 'Endereço B';
								default:
									return '';
							}
						}()
					});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage_,
										{place: _p5})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'UpdateNameSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{name: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'UpdatePhoneSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{phone: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'UpdateAddressSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{address: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'UpdateObsSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{obs: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'RequestSchedulingSchedulePage':
				if (_p0._0.ctor === 'Ok') {
					var schedulePage = model.pages.schedule;
					var pages_ = model.pages;
					var schedulePage_ = _elm_lang$core$Native_Utils.update(
						schedulePage,
						{scheduling: _p0._0._0});
					var schedulePage__ = _elm_lang$core$Native_Utils.update(
						schedulePage_,
						{scheduleLoadError: false});
					var schedulePage___ = _elm_lang$core$Native_Utils.update(
						schedulePage__,
						{scheduleLoading: false});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								pages: _elm_lang$core$Native_Utils.update(
									pages_,
									{schedule: schedulePage___})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					var schedulePage = model.pages.schedule;
					var pages_ = model.pages;
					var schedulePage_ = _elm_lang$core$Native_Utils.update(
						schedulePage,
						{scheduleLoadError: true});
					var schedulePage__ = _elm_lang$core$Native_Utils.update(
						schedulePage_,
						{scheduleLoading: false});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								pages: _elm_lang$core$Native_Utils.update(
									pages_,
									{schedule: schedulePage__})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
			case 'LoadSchedulingSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{scheduleLoading: true})
								})
						}),
					_1: _egvelho$cibertexto_website_elm$Requests$getScheduling
				};
			case 'SelectDaySchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				var schedulePage_ = _elm_lang$core$Native_Utils.update(
					schedulePage,
					{time: 0});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage_,
										{day: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SelectTimeSchedulePage':
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{time: _p0._0})
								})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'PostSchedulingSchedulePage':
				if (_p0._0.ctor === 'Ok') {
					var _p6 = _p0._0._0;
					var schedulePage = model.pages.schedule;
					var pages_ = model.pages;
					var schedulePage_ = _elm_lang$core$Native_Utils.update(
						schedulePage,
						{resultLoading: false});
					if (_elm_lang$core$Native_Utils.eq(_p6.status, 'unavailable')) {
						var schedulePage__ = _elm_lang$core$Native_Utils.update(
							schedulePage_,
							{time: 0});
						var schedulePage___ = _elm_lang$core$Native_Utils.update(
							schedulePage__,
							{
								day: A5(
									_egvelho$cibertexto_website_elm$Types$DayScheduling,
									{ctor: '[]'},
									0,
									0,
									0,
									0)
							});
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									pages: _elm_lang$core$Native_Utils.update(
										pages_,
										{
											schedule: _elm_lang$core$Native_Utils.update(
												schedulePage___,
												{result: _p6})
										})
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									pages: _elm_lang$core$Native_Utils.update(
										pages_,
										{
											schedule: _elm_lang$core$Native_Utils.update(
												schedulePage_,
												{result: _p6})
										})
								}),
							_1: _elm_lang$core$Native_Utils.eq(_p6.status, 'ok') ? _elm_lang$core$Platform_Cmd$batch(
								{
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Requests$getOrder(_p6.order),
									_1: {
										ctor: '::',
										_0: _elm_lang$navigation$Navigation$newUrl('#/andamento'),
										_1: {ctor: '[]'}
									}
								}) : _elm_lang$core$Platform_Cmd$none
						};
					}
				} else {
					var schedulePage = model.pages.schedule;
					var pages_ = model.pages;
					var schedulePage_ = _elm_lang$core$Native_Utils.update(
						schedulePage,
						{resultLoading: false});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								pages: _elm_lang$core$Native_Utils.update(
									pages_,
									{
										schedule: _elm_lang$core$Native_Utils.update(
											schedulePage_,
											{
												result: A2(_egvelho$cibertexto_website_elm$Types$RequestResult, 'error', '')
											})
									})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
			case 'SendOrderSchedulePage':
				var techSupportPage = model.pages.techSupport;
				var schedulePage = model.pages.schedule;
				var pages_ = model.pages;
				var hour = schedulePage.time;
				var monthday = schedulePage.day.monthday;
				var month = schedulePage.day.month;
				var year = schedulePage.day.year;
				var address = function () {
					var _p7 = schedulePage.place;
					switch (_p7) {
						case 0:
							return 'Endereço A';
						case 1:
							return 'Endereço B';
						default:
							return schedulePage.address;
					}
				}();
				var place = function () {
					var _p8 = schedulePage.place;
					switch (_p8) {
						case 0:
							return 'Endereço A';
						case 1:
							return 'Endereço B';
						default:
							return 'Endereço C';
					}
				}();
				var obs = schedulePage.obs;
				var phone = schedulePage.phone;
				var name = schedulePage.name;
				var backupOption = techSupportPage.toggleBackupOption;
				var problem = techSupportPage.toggleStartupProblem;
				var withBackup = techSupportPage.toggleFormatWithBackup;
				var urgency = techSupportPage.urgency;
				var option = techSupportPage.option;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{
									schedule: _elm_lang$core$Native_Utils.update(
										schedulePage,
										{resultLoading: true})
								})
						}),
					_1: _egvelho$cibertexto_website_elm$Requests$postOrder(
						_egvelho$cibertexto_website_elm$Types$SendOrder(option)(urgency)(withBackup)(problem)(backupOption)(name)(phone)(obs)(place)(address)(year)(month)(monthday)(hour))
				};
			case 'RequestOrderOrderPage':
				if (_p0._0.ctor === 'Ok') {
					var orderPage = model.pages.order;
					var pages_ = model.pages;
					var orderPage_ = _elm_lang$core$Native_Utils.update(
						orderPage,
						{loadingOrder: false});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								pages: _elm_lang$core$Native_Utils.update(
									pages_,
									{
										order: _elm_lang$core$Native_Utils.update(
											orderPage_,
											{result: _p0._0._0})
									})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					if (_p0._0._0.ctor === 'BadPayload') {
						var result_ = model.pages.order.result;
						var orderPage = model.pages.order;
						var pages_ = model.pages;
						var orderPage_ = _elm_lang$core$Native_Utils.update(
							orderPage,
							{loadingOrder: false});
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									pages: _elm_lang$core$Native_Utils.update(
										pages_,
										{
											order: _elm_lang$core$Native_Utils.update(
												orderPage_,
												{
													result: _elm_lang$core$Native_Utils.update(
														result_,
														{status: 'unavailable'})
												})
										})
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						var result_ = model.pages.order.result;
						var orderPage = model.pages.order;
						var pages_ = model.pages;
						var orderPage_ = _elm_lang$core$Native_Utils.update(
							orderPage,
							{loadingOrder: false});
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									pages: _elm_lang$core$Native_Utils.update(
										pages_,
										{
											order: _elm_lang$core$Native_Utils.update(
												orderPage_,
												{
													result: _elm_lang$core$Native_Utils.update(
														result_,
														{status: 'error'})
												})
										})
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					}
				}
			case 'LoadOrderOrderPage':
				var _p9 = _p0._0;
				if (_elm_lang$core$Native_Utils.eq(
					_elm_lang$core$String$length(_p9),
					5)) {
					var orderPage = model.pages.order;
					var pages_ = model.pages;
					var orderPage_ = _elm_lang$core$Native_Utils.update(
						orderPage,
						{id: _p9});
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								pages: _elm_lang$core$Native_Utils.update(
									pages_,
									{
										order: _elm_lang$core$Native_Utils.update(
											orderPage_,
											{loadingOrder: true})
									})
							}),
						_1: _egvelho$cibertexto_website_elm$Requests$getOrder(_p9)
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			default:
				var initOrderPage = A3(
					_egvelho$cibertexto_website_elm$Types$OrderModel,
					false,
					'',
					A2(
						_egvelho$cibertexto_website_elm$Types$OrderResult,
						'',
						_egvelho$cibertexto_website_elm$Types$OrderItem('')('')('')(false)(false)(0)(0)('')('')('')('')('')(0)(0)(
							A5(_egvelho$cibertexto_website_elm$Types$OrderItemDate, 0, 0, 0, 0, 0))));
				var pages_ = model.pages;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pages: _elm_lang$core$Native_Utils.update(
								pages_,
								{order: initOrderPage})
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});

var _egvelho$cibertexto_website_elm$Subscriptions$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material$subscriptions, _egvelho$cibertexto_website_elm$Types$Mdl, model),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Menu$subs, _egvelho$cibertexto_website_elm$Types$Mdl, model.mdl),
				_1: {
					ctor: '::',
					_0: _elm_lang$window$Window$resizes(_egvelho$cibertexto_website_elm$Types$UpdateViewport),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second * 8, _egvelho$cibertexto_website_elm$Types$UpdateBannerHomePage),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};

var _egvelho$cibertexto_website_elm$View_Header$whatsappIcon = _debois$elm_mdl$Material_Options$stylesheet('\n      #whatsapp-menu > button {\n        background-image: url(\"whatsapp.svg\");\n        background-size: cover;\n        background-repeat: no-repeat;\n      }\n\n      #whatsapp-menu i {\n        display: none;\n      }\n    ');
var _egvelho$cibertexto_website_elm$View_Header$render = function (model) {
	return {
		ctor: '::',
		_0: A2(
			_debois$elm_mdl$Material_Layout$row,
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'background-color', '#efefef'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'justify-content', 'space-between'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$img,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$attribute(
							_elm_lang$html$Html_Attributes$src('logo-black.svg')),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$css,
								'height',
								_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone) ? '24px' : '36px'),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _egvelho$cibertexto_website_elm$View_Header$whatsappIcon,
					_1: {
						ctor: '::',
						_0: A5(
							_debois$elm_mdl$Material_Menu$render,
							_egvelho$cibertexto_website_elm$Types$Mdl,
							{
								ctor: '::',
								_0: 30,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Menu$bottomRight,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$id('whatsapp-menu'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Menu$item,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('(XX) XXXXX-XXXX'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {ctor: '[]'}
	};
};

var _egvelho$cibertexto_website_elm$View_Drawer$clickItem = F2(
	function (link_, model) {
		return _egvelho$cibertexto_website_elm$Generics$onClickPreventDefault(
			_egvelho$cibertexto_website_elm$Types$ClickDrawerItem(link_));
	});
var _egvelho$cibertexto_website_elm$View_Drawer$drawerItem = F4(
	function (link_, text_, img_, model) {
		return A2(
			_debois$elm_mdl$Material_Layout$link,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Layout$href(link_),
				_1: {
					ctor: '::',
					_0: A2(_egvelho$cibertexto_website_elm$View_Drawer$clickItem, link_, model),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'row'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'center'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-grow', '2'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'order', '0'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$img,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$attribute(
							_elm_lang$html$Html_Attributes$src(img_)),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '32px'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '32px'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'border-radius', '50%'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-right', '16px'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(text_),
					_1: {ctor: '[]'}
				}
			});
	});
var _egvelho$cibertexto_website_elm$View_Drawer$render = function (model) {
	return {
		ctor: '::',
		_0: A2(
			_debois$elm_mdl$Material_Layout$title,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Options$center,
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '16px 0'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-bottom', '16px'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'background-image', 'linear-gradient(-225deg, #2CD8D5 0%, #C5C1FF 56%, #FFBAC3 100%)'),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$img,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$attribute(
							_elm_lang$html$Html_Attributes$src('logo-simple.svg')),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '96px'),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Layout$navigation,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Layout$spacer,
					_1: {
						ctor: '::',
						_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/home', 'Lorem ipsum', 'home.png', model),
						_1: {
							ctor: '::',
							_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/assistencia', 'Lorem ipsum', 'help.png', model),
							_1: {
								ctor: '::',
								_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/andamento', 'Lorem ipsum', 'clock.png', model),
								_1: {
									ctor: '::',
									_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/advogados', 'Lorem ipsum', 'lawyer.png', model),
									_1: {
										ctor: '::',
										_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/dev', 'Lorem ipsum', 'code.png', model),
										_1: {
											ctor: '::',
											_0: A4(_egvelho$cibertexto_website_elm$View_Drawer$drawerItem, '#/sobre', 'Lorem ipsum', 'document.png', model),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		}
	};
};

var _evancz$elm_markdown$Native_Markdown = function() {


// VIRTUAL-DOM WIDGETS

function toHtml(options, factList, rawMarkdown)
{
	var model = {
		options: options,
		markdown: rawMarkdown
	};
	return _elm_lang$virtual_dom$Native_VirtualDom.custom(factList, model, implementation);
}


// WIDGET IMPLEMENTATION

var implementation = {
	render: render,
	diff: diff
};

function render(model)
{
	var html = marked(model.markdown, formatOptions(model.options));
	var div = document.createElement('div');
	div.innerHTML = html;
	return div;
}

function diff(a, b)
{
	
	if (a.model.markdown === b.model.markdown && a.model.options === b.model.options)
	{
		return null;
	}

	return {
		applyPatch: applyPatch,
		data: marked(b.model.markdown, formatOptions(b.model.options))
	};
}

function applyPatch(domNode, data)
{
	domNode.innerHTML = data;
	return domNode;
}


// ACTUAL MARKDOWN PARSER

var marked = function() {
	// catch the `marked` object regardless of the outer environment.
	// (ex. a CommonJS module compatible environment.)
	// note that this depends on marked's implementation of environment detection.
	var module = {};
	var exports = module.exports = {};

	/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 * commit cd2f6f5b7091154c5526e79b5f3bfb4d15995a51
	 */
	(function(){var block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:noop,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:noop,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:noop,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};block.bullet=/(?:[*+-]|\d+\.)/;block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;block.item=replace(block.item,"gm")(/bull/g,block.bullet)();block.list=replace(block.list)(/bull/g,block.bullet)("hr","\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def","\\n+(?="+block.def.source+")")();block.blockquote=replace(block.blockquote)("def",block.def)();block._tag="(?!(?:"+"a|em|strong|small|s|cite|q|dfn|abbr|data|time|code"+"|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo"+"|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b";block.html=replace(block.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,block._tag)();block.paragraph=replace(block.paragraph)("hr",block.hr)("heading",block.heading)("lheading",block.lheading)("blockquote",block.blockquote)("tag","<"+block._tag)("def",block.def)();block.normal=merge({},block);block.gfm=merge({},block.normal,{fences:/^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,paragraph:/^/,heading:/^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/});block.gfm.paragraph=replace(block.paragraph)("(?!","(?!"+block.gfm.fences.source.replace("\\1","\\2")+"|"+block.list.source.replace("\\1","\\3")+"|")();block.tables=merge({},block.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/});function Lexer(options){this.tokens=[];this.tokens.links={};this.options=options||marked.defaults;this.rules=block.normal;if(this.options.gfm){if(this.options.tables){this.rules=block.tables}else{this.rules=block.gfm}}}Lexer.rules=block;Lexer.lex=function(src,options){var lexer=new Lexer(options);return lexer.lex(src)};Lexer.prototype.lex=function(src){src=src.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n");return this.token(src,true)};Lexer.prototype.token=function(src,top,bq){var src=src.replace(/^ +$/gm,""),next,loose,cap,bull,b,item,space,i,l;while(src){if(cap=this.rules.newline.exec(src)){src=src.substring(cap[0].length);if(cap[0].length>1){this.tokens.push({type:"space"})}}if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);cap=cap[0].replace(/^ {4}/gm,"");this.tokens.push({type:"code",text:!this.options.pedantic?cap.replace(/\n+$/,""):cap});continue}if(cap=this.rules.fences.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"code",lang:cap[2],text:cap[3]||""});continue}if(cap=this.rules.heading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[1].length,text:cap[2]});continue}if(top&&(cap=this.rules.nptable.exec(src))){src=src.substring(cap[0].length);item={type:"table",header:cap[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3].replace(/\n$/,"").split("\n")};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right"}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center"}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left"}else{item.align[i]=null}}for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].split(/ *\| */)}this.tokens.push(item);continue}if(cap=this.rules.lheading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[2]==="="?1:2,text:cap[1]});continue}if(cap=this.rules.hr.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"hr"});continue}if(cap=this.rules.blockquote.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"blockquote_start"});cap=cap[0].replace(/^ *> ?/gm,"");this.token(cap,top,true);this.tokens.push({type:"blockquote_end"});continue}if(cap=this.rules.list.exec(src)){src=src.substring(cap[0].length);bull=cap[2];this.tokens.push({type:"list_start",ordered:bull.length>1});cap=cap[0].match(this.rules.item);next=false;l=cap.length;i=0;for(;i<l;i++){item=cap[i];space=item.length;item=item.replace(/^ *([*+-]|\d+\.) +/,"");if(~item.indexOf("\n ")){space-=item.length;item=!this.options.pedantic?item.replace(new RegExp("^ {1,"+space+"}","gm"),""):item.replace(/^ {1,4}/gm,"")}if(this.options.smartLists&&i!==l-1){b=block.bullet.exec(cap[i+1])[0];if(bull!==b&&!(bull.length>1&&b.length>1)){src=cap.slice(i+1).join("\n")+src;i=l-1}}loose=next||/\n\n(?!\s*$)/.test(item);if(i!==l-1){next=item.charAt(item.length-1)==="\n";if(!loose)loose=next}this.tokens.push({type:loose?"loose_item_start":"list_item_start"});this.token(item,false,bq);this.tokens.push({type:"list_item_end"})}this.tokens.push({type:"list_end"});continue}if(cap=this.rules.html.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:!this.options.sanitizer&&(cap[1]==="pre"||cap[1]==="script"||cap[1]==="style"),text:cap[0]});continue}if(!bq&&top&&(cap=this.rules.def.exec(src))){src=src.substring(cap[0].length);this.tokens.links[cap[1].toLowerCase()]={href:cap[2],title:cap[3]};continue}if(top&&(cap=this.rules.table.exec(src))){src=src.substring(cap[0].length);item={type:"table",header:cap[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3].replace(/(?: *\| *)?\n$/,"").split("\n")};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right"}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center"}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left"}else{item.align[i]=null}}for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */)}this.tokens.push(item);continue}if(top&&(cap=this.rules.paragraph.exec(src))){src=src.substring(cap[0].length);this.tokens.push({type:"paragraph",text:cap[1].charAt(cap[1].length-1)==="\n"?cap[1].slice(0,-1):cap[1]});continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"text",text:cap[0]});continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return this.tokens};var inline={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:noop,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:noop,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};inline._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;inline._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;inline.link=replace(inline.link)("inside",inline._inside)("href",inline._href)();inline.reflink=replace(inline.reflink)("inside",inline._inside)();inline.normal=merge({},inline);inline.pedantic=merge({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/});inline.gfm=merge({},inline.normal,{escape:replace(inline.escape)("])","~|])")(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)("]|","~]|")("|","|https?://|")()});inline.breaks=merge({},inline.gfm,{br:replace(inline.br)("{2,}","*")(),text:replace(inline.gfm.text)("{2,}","*")()});function InlineLexer(links,options){this.options=options||marked.defaults;this.links=links;this.rules=inline.normal;this.renderer=this.options.renderer||new Renderer;this.renderer.options=this.options;if(!this.links){throw new Error("Tokens array requires a `links` property.")}if(this.options.gfm){if(this.options.breaks){this.rules=inline.breaks}else{this.rules=inline.gfm}}else if(this.options.pedantic){this.rules=inline.pedantic}}InlineLexer.rules=inline;InlineLexer.output=function(src,links,options){var inline=new InlineLexer(links,options);return inline.output(src)};InlineLexer.prototype.output=function(src){var out="",link,text,href,cap;while(src){if(cap=this.rules.escape.exec(src)){src=src.substring(cap[0].length);out+=cap[1];continue}if(cap=this.rules.autolink.exec(src)){src=src.substring(cap[0].length);if(cap[2]==="@"){text=cap[1].charAt(6)===":"?this.mangle(cap[1].substring(7)):this.mangle(cap[1]);href=this.mangle("mailto:")+text}else{text=escape(cap[1]);href=text}out+=this.renderer.link(href,null,text);continue}if(!this.inLink&&(cap=this.rules.url.exec(src))){src=src.substring(cap[0].length);text=escape(cap[1]);href=text;out+=this.renderer.link(href,null,text);continue}if(cap=this.rules.tag.exec(src)){if(!this.inLink&&/^<a /i.test(cap[0])){this.inLink=true}else if(this.inLink&&/^<\/a>/i.test(cap[0])){this.inLink=false}src=src.substring(cap[0].length);out+=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape(cap[0]):cap[0];continue}if(cap=this.rules.link.exec(src)){src=src.substring(cap[0].length);this.inLink=true;out+=this.outputLink(cap,{href:cap[2],title:cap[3]});this.inLink=false;continue}if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){src=src.substring(cap[0].length);link=(cap[2]||cap[1]).replace(/\s+/g," ");link=this.links[link.toLowerCase()];if(!link||!link.href){out+=cap[0].charAt(0);src=cap[0].substring(1)+src;continue}this.inLink=true;out+=this.outputLink(cap,link);this.inLink=false;continue}if(cap=this.rules.strong.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.strong(this.output(cap[2]||cap[1]));continue}if(cap=this.rules.em.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.em(this.output(cap[2]||cap[1]));continue}if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.codespan(escape(cap[2],true));continue}if(cap=this.rules.br.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.br();continue}if(cap=this.rules.del.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.del(this.output(cap[1]));continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.text(escape(this.smartypants(cap[0])));continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return out};InlineLexer.prototype.outputLink=function(cap,link){var href=escape(link.href),title=link.title?escape(link.title):null;return cap[0].charAt(0)!=="!"?this.renderer.link(href,title,this.output(cap[1])):this.renderer.image(href,title,escape(cap[1]))};InlineLexer.prototype.smartypants=function(text){if(!this.options.smartypants)return text;return text.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014\/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014\/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")};InlineLexer.prototype.mangle=function(text){if(!this.options.mangle)return text;var out="",l=text.length,i=0,ch;for(;i<l;i++){ch=text.charCodeAt(i);if(Math.random()>.5){ch="x"+ch.toString(16)}out+="&#"+ch+";"}return out};function Renderer(options){this.options=options||{}}Renderer.prototype.code=function(code,lang,escaped){if(this.options.highlight){var out=this.options.highlight(code,lang);if(out!=null&&out!==code){escaped=true;code=out}}if(!lang){return"<pre><code>"+(escaped?code:escape(code,true))+"\n</code></pre>"}return'<pre><code class="'+this.options.langPrefix+escape(lang,true)+'">'+(escaped?code:escape(code,true))+"\n</code></pre>\n"};Renderer.prototype.blockquote=function(quote){return"<blockquote>\n"+quote+"</blockquote>\n"};Renderer.prototype.html=function(html){return html};Renderer.prototype.heading=function(text,level,raw){return"<h"+level+' id="'+this.options.headerPrefix+raw.toLowerCase().replace(/[^\w]+/g,"-")+'">'+text+"</h"+level+">\n"};Renderer.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"};Renderer.prototype.list=function(body,ordered){var type=ordered?"ol":"ul";return"<"+type+">\n"+body+"</"+type+">\n"};Renderer.prototype.listitem=function(text){return"<li>"+text+"</li>\n"};Renderer.prototype.paragraph=function(text){return"<p>"+text+"</p>\n"};Renderer.prototype.table=function(header,body){return"<table>\n"+"<thead>\n"+header+"</thead>\n"+"<tbody>\n"+body+"</tbody>\n"+"</table>\n"};Renderer.prototype.tablerow=function(content){return"<tr>\n"+content+"</tr>\n"};Renderer.prototype.tablecell=function(content,flags){var type=flags.header?"th":"td";var tag=flags.align?"<"+type+' style="text-align:'+flags.align+'">':"<"+type+">";return tag+content+"</"+type+">\n"};Renderer.prototype.strong=function(text){return"<strong>"+text+"</strong>"};Renderer.prototype.em=function(text){return"<em>"+text+"</em>"};Renderer.prototype.codespan=function(text){return"<code>"+text+"</code>"};Renderer.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"};Renderer.prototype.del=function(text){return"<del>"+text+"</del>"};Renderer.prototype.link=function(href,title,text){if(this.options.sanitize){try{var prot=decodeURIComponent(unescape(href)).replace(/[^\w:]/g,"").toLowerCase()}catch(e){return""}if(prot.indexOf("javascript:")===0||prot.indexOf("vbscript:")===0||prot.indexOf("data:")===0){return""}}var out='<a href="'+href+'"';if(title){out+=' title="'+title+'"'}out+=">"+text+"</a>";return out};Renderer.prototype.image=function(href,title,text){var out='<img src="'+href+'" alt="'+text+'"';if(title){out+=' title="'+title+'"'}out+=this.options.xhtml?"/>":">";return out};Renderer.prototype.text=function(text){return text};function Parser(options){this.tokens=[];this.token=null;this.options=options||marked.defaults;this.options.renderer=this.options.renderer||new Renderer;this.renderer=this.options.renderer;this.renderer.options=this.options}Parser.parse=function(src,options,renderer){var parser=new Parser(options,renderer);return parser.parse(src)};Parser.prototype.parse=function(src){this.inline=new InlineLexer(src.links,this.options,this.renderer);this.tokens=src.reverse();var out="";while(this.next()){out+=this.tok()}return out};Parser.prototype.next=function(){return this.token=this.tokens.pop()};Parser.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0};Parser.prototype.parseText=function(){var body=this.token.text;while(this.peek().type==="text"){body+="\n"+this.next().text}return this.inline.output(body)};Parser.prototype.tok=function(){switch(this.token.type){case"space":{return""}case"hr":{return this.renderer.hr()}case"heading":{return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text)}case"code":{return this.renderer.code(this.token.text,this.token.lang,this.token.escaped)}case"table":{var header="",body="",i,row,cell,flags,j;cell="";for(i=0;i<this.token.header.length;i++){flags={header:true,align:this.token.align[i]};cell+=this.renderer.tablecell(this.inline.output(this.token.header[i]),{header:true,align:this.token.align[i]})}header+=this.renderer.tablerow(cell);for(i=0;i<this.token.cells.length;i++){row=this.token.cells[i];cell="";for(j=0;j<row.length;j++){cell+=this.renderer.tablecell(this.inline.output(row[j]),{header:false,align:this.token.align[j]})}body+=this.renderer.tablerow(cell)}return this.renderer.table(header,body)}case"blockquote_start":{var body="";while(this.next().type!=="blockquote_end"){body+=this.tok()}return this.renderer.blockquote(body)}case"list_start":{var body="",ordered=this.token.ordered;while(this.next().type!=="list_end"){body+=this.tok()}return this.renderer.list(body,ordered)}case"list_item_start":{var body="";while(this.next().type!=="list_item_end"){body+=this.token.type==="text"?this.parseText():this.tok()}return this.renderer.listitem(body)}case"loose_item_start":{var body="";while(this.next().type!=="list_item_end"){body+=this.tok()}return this.renderer.listitem(body)}case"html":{var html=!this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;return this.renderer.html(html)}case"paragraph":{return this.renderer.paragraph(this.inline.output(this.token.text))}case"text":{return this.renderer.paragraph(this.parseText())}}};function escape(html,encode){return html.replace(!encode?/&(?!#?\w+;)/g:/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function unescape(html){return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g,function(_,n){n=n.toLowerCase();if(n==="colon")return":";if(n.charAt(0)==="#"){return n.charAt(1)==="x"?String.fromCharCode(parseInt(n.substring(2),16)):String.fromCharCode(+n.substring(1))}return""})}function replace(regex,opt){regex=regex.source;opt=opt||"";return function self(name,val){if(!name)return new RegExp(regex,opt);val=val.source||val;val=val.replace(/(^|[^\[])\^/g,"$1");regex=regex.replace(name,val);return self}}function noop(){}noop.exec=noop;function merge(obj){var i=1,target,key;for(;i<arguments.length;i++){target=arguments[i];for(key in target){if(Object.prototype.hasOwnProperty.call(target,key)){obj[key]=target[key]}}}return obj}function marked(src,opt,callback){if(callback||typeof opt==="function"){if(!callback){callback=opt;opt=null}opt=merge({},marked.defaults,opt||{});var highlight=opt.highlight,tokens,pending,i=0;try{tokens=Lexer.lex(src,opt)}catch(e){return callback(e)}pending=tokens.length;var done=function(err){if(err){opt.highlight=highlight;return callback(err)}var out;try{out=Parser.parse(tokens,opt)}catch(e){err=e}opt.highlight=highlight;return err?callback(err):callback(null,out)};if(!highlight||highlight.length<3){return done()}delete opt.highlight;if(!pending)return done();for(;i<tokens.length;i++){(function(token){if(token.type!=="code"){return--pending||done()}return highlight(token.text,token.lang,function(err,code){if(err)return done(err);if(code==null||code===token.text){return--pending||done()}token.text=code;token.escaped=true;--pending||done()})})(tokens[i])}return}try{if(opt)opt=merge({},marked.defaults,opt);return Parser.parse(Lexer.lex(src,opt),opt)}catch(e){e.message+="\nPlease report this to https://github.com/chjj/marked.";if((opt||marked.defaults).silent){return"<p>An error occured:</p><pre>"+escape(e.message+"",true)+"</pre>"}throw e}}marked.options=marked.setOptions=function(opt){merge(marked.defaults,opt);return marked};marked.defaults={gfm:true,tables:true,breaks:false,pedantic:false,sanitize:false,sanitizer:null,mangle:true,smartLists:false,silent:false,highlight:null,langPrefix:"lang-",smartypants:false,headerPrefix:"",renderer:new Renderer,xhtml:false};marked.Parser=Parser;marked.parser=Parser.parse;marked.Renderer=Renderer;marked.Lexer=Lexer;marked.lexer=Lexer.lex;marked.InlineLexer=InlineLexer;marked.inlineLexer=InlineLexer.output;marked.parse=marked;if(typeof module!=="undefined"&&typeof exports==="object"){module.exports=marked}else if(typeof define==="function"&&define.amd){define(function(){return marked})}else{this.marked=marked}}).call(function(){return this||(typeof window!=="undefined"?window:global)}());

	return module.exports;
}();


// FORMAT OPTIONS FOR MARKED IMPLEMENTATION

function formatOptions(options)
{
	function toHighlight(code, lang)
	{
		if (!lang && options.defaultHighlighting.ctor === 'Just')
		{
			lang = options.defaultHighlighting._0;
		}

		if (typeof hljs !== 'undefined' && lang && hljs.listLanguages().indexOf(lang) >= 0)
		{
			return hljs.highlight(lang, code, true).value;
		}

		return code;
	}

	var gfm = options.githubFlavored;
	if (gfm.ctor === 'Just')
	{
		return {
			highlight: toHighlight,
			gfm: true,
			tables: gfm._0.tables,
			breaks: gfm._0.breaks,
			sanitize: options.sanitize,
			smartypants: options.smartypants
		};
	}

	return {
		highlight: toHighlight,
		gfm: false,
		tables: false,
		breaks: false,
		sanitize: options.sanitize,
		smartypants: options.smartypants
	};
}


// EXPORTS

return {
	toHtml: F3(toHtml)
};

}();

var _evancz$elm_markdown$Markdown$toHtmlWith = _evancz$elm_markdown$Native_Markdown.toHtml;
var _evancz$elm_markdown$Markdown$defaultOptions = {
	githubFlavored: _elm_lang$core$Maybe$Just(
		{tables: false, breaks: false}),
	defaultHighlighting: _elm_lang$core$Maybe$Nothing,
	sanitize: false,
	smartypants: false
};
var _evancz$elm_markdown$Markdown$toHtml = F2(
	function (attrs, string) {
		return A3(_evancz$elm_markdown$Native_Markdown.toHtml, _evancz$elm_markdown$Markdown$defaultOptions, attrs, string);
	});
var _evancz$elm_markdown$Markdown$Options = F4(
	function (a, b, c, d) {
		return {githubFlavored: a, defaultHighlighting: b, sanitize: c, smartypants: d};
	});

var _egvelho$cibertexto_website_elm$Page_Home$infoCard = F5(
	function (model, title, text_, link, linkName) {
		return A2(
			_debois$elm_mdl$Material_Card$view,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Elevation$e4,
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$title,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$head,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(title),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'flex', '1'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(text_),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$actions,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Card$border,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Button$render,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$accent,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Button$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Button$link(link),
												_1: {ctor: '[]'}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(linkName),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _egvelho$cibertexto_website_elm$Page_Home$infoSupport = function (model) {
	return A5(_egvelho$cibertexto_website_elm$Page_Home$infoCard, model, 'Eiusmod tempor incididunt ut labore et dolore magna aliqua', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '#/assistencia', 'Acesse');
};
var _egvelho$cibertexto_website_elm$Page_Home$infoPrivacy = function (model) {
	return A5(_egvelho$cibertexto_website_elm$Page_Home$infoCard, model, 'Eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '#/sobre', 'Saiba mais');
};
var _egvelho$cibertexto_website_elm$Page_Home$infoConsultation = function (model) {
	return A5(_egvelho$cibertexto_website_elm$Page_Home$infoCard, model, 'Eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '#/andamento', 'Consulte');
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerCard = F6(
	function (model, title, text_, link_, img_, bgColor_) {
		return A2(
			_debois$elm_mdl$Material_Card$view,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Elevation$e8,
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$background(bgColor_),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$css,
								'padding',
								function () {
									var _p0 = model.viewport;
									if (_p0.ctor === 'Desktop') {
										return '16px 64px';
									} else {
										return '16px';
									}
								}()),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$css,
									'height',
									function () {
										var _p1 = model.viewport;
										switch (_p1.ctor) {
											case 'Desktop':
												return '384px';
											case 'Tablet':
												return '256px';
											default:
												return '512px';
										}
									}()),
								_1: {
									ctor: '::',
									_0: function () {
										var _p2 = model.viewport;
										if (_p2.ctor === 'Phone') {
											return _debois$elm_mdl$Material_Options$many(
												{
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'justify-content', 'center'),
														_1: {ctor: '[]'}
													}
												});
										} else {
											return _debois$elm_mdl$Material_Options$many(
												{
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'row'),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'center'),
														_1: {ctor: '[]'}
													}
												});
										}
									}(),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$media,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$background(bgColor_),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$center,
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
									A2(_debois$elm_mdl$Material_Options$css, 'margin-right', '64px')),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$img,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$attribute(
									_elm_lang$html$Html_Attributes$src(img_)),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$css,
										'height',
										function () {
											var _p3 = model.viewport;
											switch (_p3.ctor) {
												case 'Desktop':
													return '256px';
												case 'Tablet':
													return '128px';
												default:
													return '128px';
											}
										}()),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$title,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$head,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(title),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$div,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
											_1: {ctor: '[]'}
										}
									},
									A2(
										_elm_lang$core$List$map,
										_debois$elm_mdl$Material_Card$subhead(
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
												_1: {ctor: '[]'}
											}),
										A2(
											_elm_lang$core$List$map,
											function (text_) {
												return {
													ctor: '::',
													_0: text_,
													_1: {ctor: '[]'}
												};
											},
											A2(_elm_lang$core$List$map, _elm_lang$html$Html$text, text_)))),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$div,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A5(
												_debois$elm_mdl$Material_Button$render,
												_egvelho$cibertexto_website_elm$Types$Mdl,
												{
													ctor: '::',
													_0: 0,
													_1: {ctor: '[]'}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Button$raised,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Button$link(link_),
														_1: {
															ctor: '::',
															_0: _egvelho$cibertexto_website_elm$Route$linkTo(link_),
															_1: {
																ctor: '::',
																_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '16px'),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Saiba mais'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _egvelho$cibertexto_website_elm$Page_Home$bannerAssistance = function (model) {
	return A6(
		_egvelho$cibertexto_website_elm$Page_Home$bannerCard,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
		{
			ctor: '::',
			_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			_1: {ctor: '[]'}
		},
		'#/assistencia',
		'calendar.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Cyan, _debois$elm_mdl$Material_Color$S400));
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerSupport = function (model) {
	return A6(
		_egvelho$cibertexto_website_elm$Page_Home$bannerCard,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
		{
			ctor: '::',
			_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			_1: {
				ctor: '::',
				_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				_1: {ctor: '[]'}
			}
		},
		'#/andamento',
		'request.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Purple, _debois$elm_mdl$Material_Color$S300));
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerLawyers = function (model) {
	return A6(
		_egvelho$cibertexto_website_elm$Page_Home$bannerCard,
		model,
		'Aos advogados',
		{
			ctor: '::',
			_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
			_1: {
				ctor: '::',
				_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
				_1: {
					ctor: '::',
					_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
					_1: {
						ctor: '::',
						_0: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
						_1: {ctor: '[]'}
					}
				}
			}
		},
		'#/advogados',
		'scales.svg',
		_debois$elm_mdl$Material_Color$black);
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerSites = function (model) {
	return A6(
		_egvelho$cibertexto_website_elm$Page_Home$bannerCard,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.',
		{
			ctor: '::',
			_0: 'Eiusmod tempor incididunt ut labore et dolore magna aliqua.',
			_1: {ctor: '[]'}
		},
		'#/dev',
		'website.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Lime, _debois$elm_mdl$Material_Color$S700));
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerApps = function (model) {
	return A6(
		_egvelho$cibertexto_website_elm$Page_Home$bannerCard,
		model,
		'Eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		{
			ctor: '::',
			_0: 'Eiusmod tempor incididunt ut labore et dolore magna aliqua.',
			_1: {ctor: '[]'}
		},
		'#/dev',
		'mobile.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Orange, _debois$elm_mdl$Material_Color$S300));
};
var _egvelho$cibertexto_website_elm$Page_Home$selectBanner = function (model) {
	var _p4 = model.pages.home.banner;
	switch (_p4) {
		case 0:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerAssistance(model);
		case 1:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerSupport(model);
		case 2:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerLawyers(model);
		case 3:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerSites(model);
		case 4:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerApps(model);
		default:
			return _egvelho$cibertexto_website_elm$Page_Home$bannerAssistance(model);
	}
};
var _egvelho$cibertexto_website_elm$Page_Home$bannerWithTabs = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A6(
				_debois$elm_mdl$Material_Tabs$render,
				_egvelho$cibertexto_website_elm$Types$Mdl,
				{
					ctor: '::',
					_0: 0,
					_1: {ctor: '[]'}
				},
				model.mdl,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Tabs$ripple,
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Tabs$onSelectTab(_egvelho$cibertexto_website_elm$Types$ChangeBannerHomePage),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Tabs$activeTab(model.pages.home.banner),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet),
									A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Tabs$label,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$center,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Lorem'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Tabs$label,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$center,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Lorem'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Tabs$label,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$center,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Tabs$label,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$center,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Lorem'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Tabs$label,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$center,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Lorem'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: _egvelho$cibertexto_website_elm$Page_Home$selectBanner(model),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Home$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _egvelho$cibertexto_website_elm$Page_Home$bannerWithTabs(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Grid$stretch,
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Page_Home$infoSupport(model),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Grid$stretch,
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Page_Home$infoPrivacy(model),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Grid$stretch,
												_1: {ctor: '[]'}
											}
										}
									},
									{
										ctor: '::',
										_0: _egvelho$cibertexto_website_elm$Page_Home$infoConsultation(model),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};

var _egvelho$cibertexto_website_elm$Page_TechSupport$optionView = F5(
	function (model, title_, subtitle_, order_, content) {
		return A2(
			_debois$elm_mdl$Material_Card$view,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Elevation$e8,
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '-99px'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$title,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$head,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(title_),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$subhead,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_evancz$elm_markdown$Markdown$toHtml,
										{ctor: '[]'},
										subtitle_),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: content,
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$actions,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Card$border,
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, 'main') && _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
										A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Button$render,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 5,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$accent,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Button$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onClick(
													_egvelho$cibertexto_website_elm$Types$SelectOptionTechSupportPage('')),
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Options$when,
														_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
														A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, 'main') ? 'Continuar' : 'Voltar'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A5(
										_debois$elm_mdl$Material_Button$render,
										_egvelho$cibertexto_website_elm$Types$Mdl,
										{
											ctor: '::',
											_0: 6,
											_1: {ctor: '[]'}
										},
										model.mdl,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Button$accent,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Button$ripple,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onClick(
														_egvelho$cibertexto_website_elm$Types$SelectOrderSchedulePage(order_)),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Options$when,
															_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, 'main'),
															A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
														_1: {ctor: '[]'}
													}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Agendar'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _egvelho$cibertexto_website_elm$Page_TechSupport$mainOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop) ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$HelpOrder,
		A2(
			_debois$elm_mdl$Material_Options$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_evancz$elm_markdown$Markdown$toHtml,
					{ctor: '[]'},
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
				_1: {
					ctor: '::',
					_0: A2(
						_evancz$elm_markdown$Markdown$toHtml,
						{ctor: '[]'},
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor [website](/dev) ou\n            [aplicativo para celular](/dev)?'),
					_1: {ctor: '[]'}
				}
			}));
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$formatOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$FormatOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			var withBackup = model.pages.techSupport.toggleFormatWithBackup;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$radio,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(
											_elm_lang$core$Native_Utils.eq(withBackup, false)),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$group('formatOptionBackup'),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onToggle(
													_egvelho$cibertexto_website_elm$Types$ToggleFormatBackupTechSupportPage(false)),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Toggles$radio,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$ripple,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$value(
												_elm_lang$core$Native_Utils.eq(withBackup, true)),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$group('formatOptionBackup'),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onToggle(
														_egvelho$cibertexto_website_elm$Types$ToggleFormatBackupTechSupportPage(true)),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A5(
										_debois$elm_mdl$Material_Toggles$switch,
										_egvelho$cibertexto_website_elm$Types$Mdl,
										{
											ctor: '::',
											_0: 2,
											_1: {ctor: '[]'}
										},
										model.mdl,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$value(urgency),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
														_1: {ctor: '[]'}
													}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Lorem ipsum!'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$display2,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													A2(
														_elm_lang$core$Basics_ops['++'],
														'R$ ',
														(withBackup && urgency) ? 'XXX,XX' : (withBackup ? 'XXX,XX' : (urgency ? 'XXX,XX' : 'XXX,XX')))),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Grid$cell,
										{
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: A3(
												_debois$elm_mdl$Material_Options$styled,
												_elm_lang$html$Html$p,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Typography$headline,
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'Lorem ipsum dolor ',
															urgency ? '2 dias' : '7 dias')),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$programProblemOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$ProgramProblemOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$switch,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(urgency),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum!'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$display2,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'R$ ',
												urgency ? 'XXX,XX' : 'XXX,XX')),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Entrega ',
													urgency ? 'na hora!' : 'em 3 dias')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$trollProgramOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$TrollProgramOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$switch,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(urgency),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum!'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$display2,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'R$ ',
												urgency ? 'XXX,XX' : 'XXX,XX')),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Entrega ',
													urgency ? 'na hora!' : 'em 2 dias')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$startupProblemOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$StartupProblemOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			var problem = model.pages.techSupport.toggleStartupProblem;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$radio,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(
											_elm_lang$core$Native_Utils.eq(problem, 0)),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$group('startupOptionProblem'),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onToggle(
													_egvelho$cibertexto_website_elm$Types$ToggleStartupProblemTechSupportPage(0)),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Toggles$radio,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$ripple,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$value(
												_elm_lang$core$Native_Utils.eq(problem, 1)),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$group('startupOptionProblem'),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onToggle(
														_egvelho$cibertexto_website_elm$Types$ToggleStartupProblemTechSupportPage(1)),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A5(
										_debois$elm_mdl$Material_Toggles$radio,
										_egvelho$cibertexto_website_elm$Types$Mdl,
										{
											ctor: '::',
											_0: 2,
											_1: {ctor: '[]'}
										},
										model.mdl,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$value(
													_elm_lang$core$Native_Utils.eq(problem, 2)),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Toggles$group('startupOptionProblem'),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$onToggle(
															_egvelho$cibertexto_website_elm$Types$ToggleStartupProblemTechSupportPage(2)),
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A5(
											_debois$elm_mdl$Material_Toggles$switch,
											_egvelho$cibertexto_website_elm$Types$Mdl,
											{
												ctor: '::',
												_0: 3,
												_1: {ctor: '[]'}
											},
											model.mdl,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$ripple,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Toggles$value(urgency),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
															_1: {ctor: '[]'}
														}
													}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Lorem ipsum!'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Grid$cell,
										{
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: A3(
												_debois$elm_mdl$Material_Options$styled,
												_elm_lang$html$Html$p,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Typography$display2,
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'R$ ',
															function () {
																var price = urgency ? 120 : 80;
																var _p0 = problem;
																switch (_p0) {
																	case 0:
																		return A2(
																			F2(
																				function (x, y) {
																					return A2(_elm_lang$core$Basics_ops['++'], x, y);
																				}),
																			_elm_lang$core$Basics$toString(price),
																			',00');
																	case 1:
																		return A2(
																			F2(
																				function (x, y) {
																					return A2(_elm_lang$core$Basics_ops['++'], x, y);
																				}),
																			_elm_lang$core$Basics$toString(price + 20),
																			',00');
																	case 2:
																		return A2(
																			F2(
																				function (x, y) {
																					return A2(_elm_lang$core$Basics_ops['++'], x, y);
																				}),
																			_elm_lang$core$Basics$toString(price + 300),
																			',00');
																	default:
																		return A2(
																			F2(
																				function (x, y) {
																					return A2(_elm_lang$core$Basics_ops['++'], x, y);
																				}),
																			_elm_lang$core$Basics$toString(price),
																			',00');
																}
															}())),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Grid$cell,
											{
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: A3(
													_debois$elm_mdl$Material_Options$styled,
													_elm_lang$html$Html$p,
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Typography$headline,
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text(
															A2(
																_elm_lang$core$Basics_ops['++'],
																'Lorem ipsum dolor ',
																urgency ? '3 dias' : '7 dias')),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Grid$cell,
												{
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A3(
														_debois$elm_mdl$Material_Options$styled,
														_elm_lang$html$Html$p,
														{
															ctor: '::',
															_0: _debois$elm_mdl$Material_Typography$body2,
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('OBS: Lorem ipsum dolor.'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$lostFilesOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$LostFilesOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_debois$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$p,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Typography$body2,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Toggles$switch,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 0,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$ripple,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$value(urgency),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Lorem ipsum!'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$display2,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'R$ ',
													urgency ? 'XXX,XX' : 'XXX,XX')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$headline,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													A2(
														_elm_lang$core$Basics_ops['++'],
														'Entrega ',
														urgency ? 'em 2 dias' : 'em 5 dias')),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$slowOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$SlowProblemOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$switch,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(urgency),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum!'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$display2,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'R$ ',
												urgency ? 'XXX,XX' : 'XXX,XX')),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Lorem ipsum dolor ',
													urgency ? '2 dias' : '4 dias')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$newProgramOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet',
		_egvelho$cibertexto_website_elm$Types$NewProgramOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$switch,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(urgency),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum!'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$display2,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'R$ ',
												urgency ? 'XXX,XX' : 'XXX,XX')),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Lorem ipsum dolor ',
													urgency ? '1 dia' : '2 dias')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$body2,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: A2(
													_evancz$elm_markdown$Markdown$toHtml,
													{ctor: '[]'},
													'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A3(
												_debois$elm_mdl$Material_Options$styled,
												_elm_lang$html$Html$p,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Typography$body2,
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor!'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$backupOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$BackupOrder,
		function () {
			var backupOption = model.pages.techSupport.toggleBackupOption;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$radio,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(
											_elm_lang$core$Native_Utils.eq(backupOption, 0)),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$group('backupOption'),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onToggle(
													_egvelho$cibertexto_website_elm$Types$ToggleBackupOptionTechSupportPage(0)),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Toggles$radio,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$ripple,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$value(
												_elm_lang$core$Native_Utils.eq(backupOption, 1)),
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$group('backupOption'),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onToggle(
														_egvelho$cibertexto_website_elm$Types$ToggleBackupOptionTechSupportPage(1)),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$display2,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'R$ ',
													_elm_lang$core$Native_Utils.eq(backupOption, 0) ? 'XXX,XX' : 'XXX,XX')),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$headline,
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Options$when,
														_elm_lang$core$Native_Utils.eq(backupOption, 0),
														A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(' + custo do dispositivo'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$headline,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Lorem ipsum dolor 8 dias'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$virusOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$VirusOrder,
		function () {
			var urgency = model.pages.techSupport.urgency;
			return A2(
				_debois$elm_mdl$Material_Grid$grid,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Toggles$switch,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 2,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Toggles$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Toggles$value(urgency),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onToggle(_egvelho$cibertexto_website_elm$Types$ToggleUrgencyTechSupportPage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum!'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$display2,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'R$ ',
												urgency ? 'XXX,XX' : 'XXX,XX')),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Entrega ',
													urgency ? 'na hora!' : 'em 3 dias')),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		}());
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$helpOption = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_TechSupport$optionView,
		model,
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
		_egvelho$cibertexto_website_elm$Types$HelpOrder,
		A3(
			_debois$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$p,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Typography$display2,
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('R$ 50,00'),
				_1: {ctor: '[]'}
			}));
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$options = function (model) {
	var _p1 = model.pages.techSupport.option;
	switch (_p1) {
		case 'main':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$mainOption(model);
		case 'format':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$formatOption(model);
		case 'programProblem':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$programProblemOption(model);
		case 'trollProgram':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$trollProgramOption(model);
		case 'startupProblem':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$startupProblemOption(model);
		case 'lostFiles':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$lostFilesOption(model);
		case 'slowProblem':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$slowOption(model);
		case 'newProgram':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$newProgramOption(model);
		case 'backup':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$backupOption(model);
		case 'virus':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$virusOption(model);
		case 'help':
			return _egvelho$cibertexto_website_elm$Page_TechSupport$helpOption(model);
		default:
			return _elm_lang$html$Html$text('');
	}
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$techItem = F4(
	function (model, text_, img_, option_) {
		return A2(
			_debois$elm_mdl$Material_List$li,
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'cursor', 'pointer'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Options$onClick(
						_egvelho$cibertexto_website_elm$Types$SelectOptionTechSupportPage(option_)),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, option_),
							_debois$elm_mdl$Material_Options$many(
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$background(
										A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Grey, _debois$elm_mdl$Material_Color$S200)),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'border-radius', '2px'),
										_1: {ctor: '[]'}
									}
								})),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_List$content,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_List$avatarImage,
							img_,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'block'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '40px'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '40px'),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text(text_),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _egvelho$cibertexto_website_elm$Page_TechSupport$techItems = function (model) {
	return A2(
		_debois$elm_mdl$Material_List$ul,
		{
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material_Options$css, 'padding-left', '8px'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'padding-right', '8px'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'format.png', 'format'),
			_1: {
				ctor: '::',
				_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'stopped.png', 'programProblem'),
				_1: {
					ctor: '::',
					_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'adware.png', 'trollProgram'),
					_1: {
						ctor: '::',
						_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'confusion.png', 'startupProblem'),
						_1: {
							ctor: '::',
							_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'lost-files.png', 'lostFiles'),
							_1: {
								ctor: '::',
								_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'slow.png', 'slowProblem'),
								_1: {
									ctor: '::',
									_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'new-program.png', 'newProgram'),
									_1: {
										ctor: '::',
										_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'backup.png', 'backup'),
										_1: {
											ctor: '::',
											_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'virus.png', 'virus'),
											_1: {
												ctor: '::',
												_0: A4(_egvelho$cibertexto_website_elm$Page_TechSupport$techItem, model, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', 'help.png', 'help'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$subHeader = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Color$background(_debois$elm_mdl$Material_Color$primary),
			_1: {
				ctor: '::',
				_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '256px'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '0 40px'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'flex-end'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A3(
				_debois$elm_mdl$Material_Options$styled,
				_elm_lang$html$Html$h1,
				{
					ctor: '::',
					_0: ((!_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, '')) && (_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet))) ? A2(_debois$elm_mdl$Material_Options$css, 'display', 'none') : _debois$elm_mdl$Material_Options$nop,
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'font-size', '48px'),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Lorem ipsum dolor?'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _egvelho$cibertexto_website_elm$Page_TechSupport$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_TechSupport$subHeader(model),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Grid$grid,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											!_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, ''),
											_debois$elm_mdl$Material_Grid$hide(_debois$elm_mdl$Material_Grid$Phone)),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												!_elm_lang$core$Native_Utils.eq(model.pages.techSupport.option, ''),
												_debois$elm_mdl$Material_Grid$hide(_debois$elm_mdl$Material_Grid$Tablet)),
											_1: {ctor: '[]'}
										}
									}
								}
							},
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Page_TechSupport$techItems(model),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Grid$stretch,
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Page_TechSupport$options(model),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Page_Order$errorView = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Options$center,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A3(
				_debois$elm_mdl$Material_Options$styled,
				_elm_lang$html$Html$p,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Typography$body2,
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$text(
							A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Red, _debois$elm_mdl$Material_Color$S500)),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Ops! Parece que ocorreu um problema de conexão.'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A5(
					_debois$elm_mdl$Material_Button$render,
					_egvelho$cibertexto_website_elm$Types$Mdl,
					{
						ctor: '::',
						_0: 40,
						_1: {ctor: '[]'}
					},
					model.mdl,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Button$ripple,
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Button$raised,
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$onClick(
									_egvelho$cibertexto_website_elm$Types$LoadOrderOrderPage(model.pages.order.id)),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '4px'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-bottom', '16px'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Tentar novamente'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Order$inputOrderCard = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e4,
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$when,
					_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
					_debois$elm_mdl$Material_Options$many(
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'margin', '8px'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
								_1: {ctor: '[]'}
							}
						})),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$title,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$head,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-left', 'auto'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-right', 'auto'),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Entre com a sua senha'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$subhead,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-left', 'auto'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-right', 'auto'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$text,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$center,
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A5(
							_debois$elm_mdl$Material_Textfield$render,
							_egvelho$cibertexto_website_elm$Types$Mdl,
							{
								ctor: '::',
								_0: 2,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Textfield$maxlength(5),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$when, model.pages.order.loadingOrder, _debois$elm_mdl$Material_Textfield$disabled),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$onInput(
											function (id_) {
												return _egvelho$cibertexto_website_elm$Types$LoadOrderOrderPage(id_);
											}),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Spinner$spinner(
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Spinner$active(model.pages.order.loadingOrder),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: ((!model.pages.order.loadingOrder) && _elm_lang$core$Native_Utils.eq(model.pages.order.result.status, 'error')) ? _egvelho$cibertexto_website_elm$Page_Order$errorView(model) : (((!model.pages.order.loadingOrder) && _elm_lang$core$Native_Utils.eq(model.pages.order.result.status, 'unavailable')) ? A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$body2,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Color$text(
												A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Red, _debois$elm_mdl$Material_Color$S500)),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Este número de pedido é inválido.'),
										_1: {ctor: '[]'}
									}) : _elm_lang$html$Html$text('')),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Order$getFullOption = function (option_) {
	var _p0 = option_;
	switch (_p0) {
		case 'format':
			return 'Eiusmod tempor incididunt';
		case 'programProblem':
			return 'Eiusmod tempor incididunt';
		case 'trollProblem':
			return 'Eiusmod tempor incididunt';
		case 'startupProblem':
			return 'Eiusmod tempor incididunt';
		case 'lostFiles':
			return 'Eiusmod tempor incididunt';
		case 'slowProblem':
			return 'Eiusmod tempor incididunt';
		case 'newProgram':
			return 'Eiusmod tempor incididunt';
		case 'backup':
			return 'Eiusmod tempor incididunt';
		case 'virus':
			return 'Eiusmod tempor incididunt';
		case 'help':
			return 'Eiusmod tempor incididunt';
		case 'lawyer':
			return 'Eiusmod tempor incididunt';
		case 'development':
			return 'Eiusmod tempor incididunt';
		default:
			return 'Eiusmod tempor incididunt';
	}
};
var _egvelho$cibertexto_website_elm$Page_Order$resultCard = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e4,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
						A2(_debois$elm_mdl$Material_Options$css, 'margin', '8px')),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$when,
							!_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
							A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '40px')),
						_1: {ctor: '[]'}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$title,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$head,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-left', 'auto'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-right', 'auto'),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Informações do pedido'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$text,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$center,
						_1: {ctor: '[]'}
					},
					function () {
						var order_ = model.pages.order.result.order;
						return {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Table$table,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'border', 'none'),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Options$when,
											_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
											A2(_debois$elm_mdl$Material_Options$css, 'white-space', 'initial')),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Table$tbody,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Table$tr,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Table$th,
														{
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
															_1: {
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Pedido'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Table$td,
															{
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text(
																	_egvelho$cibertexto_website_elm$Page_Order$getFullOption(order_.option)),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Table$tr,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Table$th,
															{
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('Nº do pedido'),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Table$td,
																{
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: A3(
																		_debois$elm_mdl$Material_Options$styled,
																		_elm_lang$html$Html$span,
																		{
																			ctor: '::',
																			_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$primary),
																			_1: {ctor: '[]'}
																		},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(order_.id),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Table$tr,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Table$th,
																{
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('Custo'),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Table$td,
																	{
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																		_1: {
																			ctor: '::',
																			_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																			_1: {ctor: '[]'}
																		}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text(
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				'R$ ',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_elm_lang$core$Basics$toString(order_.price),
																					',00'))),
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Table$tr,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Table$th,
																	{
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																		_1: {
																			ctor: '::',
																			_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																			_1: {ctor: '[]'}
																		}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Situação'),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Table$td,
																		{
																			ctor: '::',
																			_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																			_1: {
																				ctor: '::',
																				_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																				_1: {ctor: '[]'}
																			}
																		},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(order_.status),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Table$tr,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Table$th,
																		{
																			ctor: '::',
																			_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																			_1: {
																				ctor: '::',
																				_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																				_1: {ctor: '[]'}
																			}
																		},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Prazo de entrega'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_debois$elm_mdl$Material_Table$td,
																			{
																				ctor: '::',
																				_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																				_1: {
																					ctor: '::',
																					_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																					_1: {ctor: '[]'}
																				}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(
																					_elm_lang$core$Native_Utils.eq(order_.delivery, 0) ? 'No encontro' : A2(
																						_elm_lang$core$Basics_ops['++'],
																						_elm_lang$core$Basics$toString(order_.delivery),
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							_elm_lang$core$Native_Utils.eq(order_.delivery, 1) ? ' dia' : ' dias',
																							' (à partir da data da entrega)'))),
																				_1: {ctor: '[]'}
																			}),
																		_1: {ctor: '[]'}
																	}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Table$tr,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: A2(
																			_debois$elm_mdl$Material_Table$th,
																			{
																				ctor: '::',
																				_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																				_1: {
																					ctor: '::',
																					_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																					_1: {ctor: '[]'}
																				}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('Cliente'),
																				_1: {ctor: '[]'}
																			}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_debois$elm_mdl$Material_Table$td,
																				{
																					ctor: '::',
																					_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																					_1: {
																						ctor: '::',
																						_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																						_1: {ctor: '[]'}
																					}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(order_.name),
																					_1: {ctor: '[]'}
																				}),
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Table$tr,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: A2(
																				_debois$elm_mdl$Material_Table$th,
																				{
																					ctor: '::',
																					_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																					_1: {
																						ctor: '::',
																						_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																						_1: {ctor: '[]'}
																					}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('Celular'),
																					_1: {ctor: '[]'}
																				}),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_debois$elm_mdl$Material_Table$td,
																					{
																						ctor: '::',
																						_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																						_1: {
																							ctor: '::',
																							_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																							_1: {ctor: '[]'}
																						}
																					},
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html$text(order_.phone),
																						_1: {ctor: '[]'}
																					}),
																				_1: {ctor: '[]'}
																			}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_debois$elm_mdl$Material_Table$tr,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: A2(
																					_debois$elm_mdl$Material_Table$th,
																					{
																						ctor: '::',
																						_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																						_1: {
																							ctor: '::',
																							_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																							_1: {ctor: '[]'}
																						}
																					},
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html$text('Local de encontro'),
																						_1: {ctor: '[]'}
																					}),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_debois$elm_mdl$Material_Table$td,
																						{
																							ctor: '::',
																							_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																							_1: {
																								ctor: '::',
																								_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																								_1: {ctor: '[]'}
																							}
																						},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(order_.place),
																							_1: {ctor: '[]'}
																						}),
																					_1: {ctor: '[]'}
																				}
																			}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_debois$elm_mdl$Material_Table$tr,
																				{ctor: '[]'},
																				{
																					ctor: '::',
																					_0: A2(
																						_debois$elm_mdl$Material_Table$th,
																						{
																							ctor: '::',
																							_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																							_1: {
																								ctor: '::',
																								_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																								_1: {ctor: '[]'}
																							}
																						},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('Endereço'),
																							_1: {ctor: '[]'}
																						}),
																					_1: {
																						ctor: '::',
																						_0: A2(
																							_debois$elm_mdl$Material_Table$td,
																							{
																								ctor: '::',
																								_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																								_1: {
																									ctor: '::',
																									_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																									_1: {ctor: '[]'}
																								}
																							},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text(order_.address),
																								_1: {ctor: '[]'}
																							}),
																						_1: {ctor: '[]'}
																					}
																				}),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_debois$elm_mdl$Material_Table$tr,
																					{ctor: '[]'},
																					{
																						ctor: '::',
																						_0: A2(
																							_debois$elm_mdl$Material_Table$th,
																							{
																								ctor: '::',
																								_0: A2(_debois$elm_mdl$Material_Options$css, 'vertical-align', 'middle'),
																								_1: {
																									ctor: '::',
																									_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '12px 18px'),
																									_1: {ctor: '[]'}
																								}
																							},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Data do encontro'),
																								_1: {ctor: '[]'}
																							}),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_debois$elm_mdl$Material_Table$td,
																								{
																									ctor: '::',
																									_0: A2(_debois$elm_mdl$Material_Options$css, 'border-top', 'none'),
																									_1: {
																										ctor: '::',
																										_0: A2(_debois$elm_mdl$Material_Options$css, 'border-bottom', 'none'),
																										_1: {ctor: '[]'}
																									}
																								},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text(
																										A2(
																											_elm_lang$core$Basics_ops['++'],
																											'Dia ',
																											A2(
																												_elm_lang$core$Basics_ops['++'],
																												_elm_lang$core$Basics$toString(order_.date.monthday),
																												A2(
																													_elm_lang$core$Basics_ops['++'],
																													' de ',
																													A2(
																														_elm_lang$core$Basics_ops['++'],
																														_egvelho$cibertexto_website_elm$Generics$monthToString(order_.date.month),
																														A2(
																															_elm_lang$core$Basics_ops['++'],
																															' de ',
																															A2(
																																_elm_lang$core$Basics_ops['++'],
																																_elm_lang$core$Basics$toString(order_.date.year),
																																A2(
																																	_elm_lang$core$Basics_ops['++'],
																																	', ',
																																	_egvelho$cibertexto_website_elm$Generics$weekdayToString(order_.date.weekday))))))))),
																									_1: {ctor: '[]'}
																								}),
																							_1: {ctor: '[]'}
																						}
																					}),
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						};
					}()),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_evancz$elm_markdown$Markdown$toHtml,
								{ctor: '[]'},
								'**OBS:** Eiusmod tempor incididunt.'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$actions,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Card$border,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Button$render,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 98,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$accent,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Button$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Options$onClick(_egvelho$cibertexto_website_elm$Types$RestartOrderPage),
												_1: {ctor: '[]'}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Ok'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Order$backgroundImage = _debois$elm_mdl$Material_Options$stylesheet('\n      body {\n        background-image: url(\"order-background.svg\");\n        background-size: cover;\n        background-repeat: no-repeat;\n        background-position: top;\n      }\n    ');
var _egvelho$cibertexto_website_elm$Page_Order$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Options$when,
				_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
				_debois$elm_mdl$Material_Options$many(
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'flex'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'align-items', 'center'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'justify-content', 'center'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												!_elm_lang$core$Native_Utils.eq(model.pages.order.result.status, 'ok'),
												A2(_debois$elm_mdl$Material_Options$css, 'position', 'absolute')),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_Order$backgroundImage,
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Native_Utils.eq(model.pages.order.result.status, 'ok') ? _egvelho$cibertexto_website_elm$Page_Order$resultCard(model) : _egvelho$cibertexto_website_elm$Page_Order$inputOrderCard(model),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Page_Lawyers$privacyInfoCard = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e8,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$media,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$background(
						A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Pink, _debois$elm_mdl$Material_Color$A200)),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '32px'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-left', '16px'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$img,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$attribute(
										_elm_lang$html$Html_Attributes$src('support.svg')),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '128px'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$title,
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'flex', '1'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$head,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Lorem ipsum dolor'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$subhead,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A3(
								_debois$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$h2,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Typography$display1,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('R$ 90,00'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$actions,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Card$border,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Button$render,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$accent,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Button$ripple,
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Solicite'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Lawyers$promoCard = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e8,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$media,
				{
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$background(
						A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Indigo, _debois$elm_mdl$Material_Color$S500)),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Options$center,
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin', '16px 0'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$img,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$attribute(
										_elm_lang$html$Html_Attributes$src('lock.svg')),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '128px'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$title,
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'flex', '1'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$head,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Eiusmod tempor incididunt ut labore et'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$subhead,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$actions,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Card$border,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Button$render,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Button$accent,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$ripple,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onClick(
												_egvelho$cibertexto_website_elm$Types$SelectOrderSchedulePage(_egvelho$cibertexto_website_elm$Types$LawyerOrder)),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Eiusmod tempor incididunt ut'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Lawyers$accessHelpCard = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e8,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$title,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$head,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Um problema de transição'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$text,
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_evancz$elm_markdown$Markdown$toHtml,
							{ctor: '[]'},
							'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_evancz$elm_markdown$Markdown$toHtml,
								{ctor: '[]'},
								'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$text,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_evancz$elm_markdown$Markdown$toHtml,
									{ctor: '[]'},
									'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$text,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_evancz$elm_markdown$Markdown$toHtml,
										{ctor: '[]'},
										'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Card$text,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: A2(
											_evancz$elm_markdown$Markdown$toHtml,
											{ctor: '[]'},
											'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Lawyers$subHeader = function (model) {
	return A2(
		_debois$elm_mdl$Material_Grid$grid,
		{
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '512px'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'padding', '0 40px'),
				_1: {
					ctor: '::',
					_0: _debois$elm_mdl$Material_Color$background(_debois$elm_mdl$Material_Color$black),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Grid$noSpacing,
						_1: {ctor: '[]'}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Grid$cell,
				{
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 8),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Tablet, 12),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Phone, 12),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Phone, 2),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Tablet, 2),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Grid$align(_debois$elm_mdl$Material_Grid$Middle),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				},
				{
					ctor: '::',
					_0: A3(
						_debois$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html$h1,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'center'),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Options$when,
										_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
										_debois$elm_mdl$Material_Typography$headline),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Eiusmod tempor incididunt ut labore'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Grid$cell,
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Tablet, 12),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Phone, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Phone, 1),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Tablet, 1),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Grid$align(_debois$elm_mdl$Material_Grid$Middle),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$div,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '256px'),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$center,
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$img,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$attribute(
											_elm_lang$html$Html_Attributes$src('scales.svg')),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
											_1: {ctor: '[]'}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Lawyers$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_Lawyers$subHeader(model),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Grid$grid,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Grid$maxWidth('900px'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
								A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '-90px')),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 8),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Phone, 2),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Tablet, 2),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$when,
													_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
													A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '-8px')),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							},
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Page_Lawyers$accessHelpCard(model),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Phone, 1),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Grid$order, _debois$elm_mdl$Material_Grid$Tablet, 1),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Grid$stretch,
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Grid$grid,
										{
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Options$when,
												_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
												_debois$elm_mdl$Material_Grid$noSpacing),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$when,
													_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
													A2(_debois$elm_mdl$Material_Options$css, 'margin', '-16px -16px 0 -16px')),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Grid$cell,
												{
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 12),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Grid$stretch,
														_1: {
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Options$when,
																_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
																A2(_debois$elm_mdl$Material_Options$css, 'margin-bottom', '16px')),
															_1: {ctor: '[]'}
														}
													}
												},
												{
													ctor: '::',
													_0: _egvelho$cibertexto_website_elm$Page_Lawyers$promoCard(model),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Grid$cell,
													{
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 12),
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Grid$stretch,
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: _egvelho$cibertexto_website_elm$Page_Lawyers$privacyInfoCard(model),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Page_Development$infoCard = F5(
	function (model, title_, text_, image_, color_) {
		return A2(
			_debois$elm_mdl$Material_Card$view,
			{
				ctor: '::',
				_0: _debois$elm_mdl$Material_Elevation$e8,
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '100%'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$media,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Color$background(color_),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$div,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Options$center,
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin', '16px 0'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$img,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$attribute(
											_elm_lang$html$Html_Attributes$src(image_)),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'height', '128px'),
											_1: {ctor: '[]'}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$title,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$head,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(title_),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$text,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_evancz$elm_markdown$Markdown$toHtml,
									{ctor: '[]'},
									text_),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _egvelho$cibertexto_website_elm$Page_Development$materialDesignCard = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_Development$infoCard,
		model,
		'Material Design',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		'material-design.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Teal, _debois$elm_mdl$Material_Color$S500));
};
var _egvelho$cibertexto_website_elm$Page_Development$lambdaCard = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_Development$infoCard,
		model,
		'O poder do lambda',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		'lambda.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Indigo, _debois$elm_mdl$Material_Color$S500));
};
var _egvelho$cibertexto_website_elm$Page_Development$mobileFirstCard = function (model) {
	return A5(
		_egvelho$cibertexto_website_elm$Page_Development$infoCard,
		model,
		'Mobile First',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		'mobile-first.svg',
		A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Pink, _debois$elm_mdl$Material_Color$S500));
};
var _egvelho$cibertexto_website_elm$Page_Development$headerContact = function (model) {
	return A2(
		_debois$elm_mdl$Material_Card$view,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Elevation$e4,
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet),
						A2(_debois$elm_mdl$Material_Options$css, 'max-width', '330px')),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Card$title,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$head,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Entre em contato!'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$subhead,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$actions,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Card$border,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A5(
							_debois$elm_mdl$Material_Button$render,
							_egvelho$cibertexto_website_elm$Types$Mdl,
							{
								ctor: '::',
								_0: 1,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Button$ripple,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Button$accent,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$onClick(
											_egvelho$cibertexto_website_elm$Types$SelectOrderSchedulePage(_egvelho$cibertexto_website_elm$Types$DevelopmentOrder)),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Agende uma reunião'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Development$headerBenefits = function (model) {
	return A2(
		_debois$elm_mdl$Material_List$ul,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_List$li,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_List$content,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_List$avatarImage,
								'search.png',
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text('Otimização SEO'),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_List$li,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_List$content,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_List$avatarImage,
									'share.png',
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text('Conexão com redes sociais'),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_List$li,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_List$content,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_List$avatarImage,
										'startup.png',
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text('Hospedagem e suporte'),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Development$headerAbout = function (model) {
	return A2(
		_debois$elm_mdl$Material_List$ul,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_List$li,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_List$content,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_List$avatarImage,
								'e-commerce.png',
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text('Lojas virtuais'),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_List$li,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_List$content,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_List$avatarImage,
									'catalogs.png',
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text('Catálogos de produtos online'),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_List$li,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_List$content,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_List$avatarImage,
										'kitchen.png',
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text('Aplicativos para restaurantes'),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_List$li,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_List$content,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_List$avatarImage,
											'checked.png',
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text('O que você precisar!'),
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Development$headerTitle = function (model) {
	return A3(
		_debois$elm_mdl$Material_Options$styled,
		function () {
			var _p0 = model.viewport;
			switch (_p0.ctor) {
				case 'Phone':
					return _elm_lang$html$Html$h3;
				case 'Tablet':
					return _elm_lang$html$Html$h2;
				default:
					return _elm_lang$html$Html$h1;
			}
		}(),
		{
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'center'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text('Criação de sites e aplicativos para celular'),
			_1: {ctor: '[]'}
		});
};
var _egvelho$cibertexto_website_elm$Page_Development$subHeader = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{
			ctor: '::',
			_0: A2(_debois$elm_mdl$Material_Options$css, 'background-image', 'url(\"dev-background.svg\")'),
			_1: {
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'background-size', 'cover'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'background-repeat', 'no-repeat'),
					_1: {
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'background-position', 'top'),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Options$when,
								_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
								A2(_debois$elm_mdl$Material_Options$css, 'padding-bottom', '90px')),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Options$when,
									_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
									A2(_debois$elm_mdl$Material_Options$css, 'height', '800px')),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_debois$elm_mdl$Material_Grid$grid,
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Options$when,
						_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
						_debois$elm_mdl$Material_Options$many(
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-left', '40px'),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-right', '40px'),
									_1: {ctor: '[]'}
								}
							})),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Grid$cell,
						{
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Grid$align(_debois$elm_mdl$Material_Grid$Middle),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Options$center,
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _egvelho$cibertexto_website_elm$Page_Development$headerTitle(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Options$center,
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Page_Development$headerAbout(model),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 6),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$center,
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$css,
													'flex-direction',
													function () {
														var _p1 = model.viewport;
														switch (_p1.ctor) {
															case 'Desktop':
																return 'column';
															case 'Tablet':
																return 'row';
															default:
																return 'column';
														}
													}()),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Page_Development$headerBenefits(model),
									_1: {
										ctor: '::',
										_0: _egvelho$cibertexto_website_elm$Page_Development$headerContact(model),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _egvelho$cibertexto_website_elm$Page_Development$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_Development$subHeader(model),
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Grid$grid,
					{
						ctor: '::',
						_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '-90px'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Grid$cell,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
								_1: {
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _egvelho$cibertexto_website_elm$Page_Development$materialDesignCard(model),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Grid$cell,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _egvelho$cibertexto_website_elm$Page_Development$mobileFirstCard(model),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Grid$cell,
									{
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$All, 12),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Grid$size, _debois$elm_mdl$Material_Grid$Desktop, 4),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _egvelho$cibertexto_website_elm$Page_Development$lambdaCard(model),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Page_About$backgroundImage = _debois$elm_mdl$Material_Options$stylesheet('\n      body {\n        background-image: url(\"about-background.svg\");\n        background-size: cover;\n        background-repeat: no-repeat;\n        background-position: top;\n      }\n    ');
var _egvelho$cibertexto_website_elm$Page_About$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_About$backgroundImage,
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$div,
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$css,
							'margin',
							_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop) ? '40px' : '16px'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '640px'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$view,
							{
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Elevation$e8,
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Card$title,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Card$head,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet?'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Card$text,
										{
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: A2(
												_evancz$elm_markdown$Markdown$toHtml,
												{ctor: '[]'},
												'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_debois$elm_mdl$Material_Card$title,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Card$head,
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet'),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_debois$elm_mdl$Material_Card$text,
												{
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: A2(
														_evancz$elm_markdown$Markdown$toHtml,
														{ctor: '[]'},
														'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Card$text,
													{
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: A2(
															_evancz$elm_markdown$Markdown$toHtml,
															{ctor: '[]'},
															'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Card$title,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Card$head,
																{
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
																	_1: {ctor: '[]'}
																},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet'),
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Card$text,
															{
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: A2(
																	_evancz$elm_markdown$Markdown$toHtml,
																	{ctor: '[]'},
																	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_debois$elm_mdl$Material_Card$title,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Card$head,
																		{
																			ctor: '::',
																			_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
																			_1: {ctor: '[]'}
																		},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Card$text,
																	{
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'text-align', 'justify'),
																		_1: {
																			ctor: '::',
																			_0: A2(_debois$elm_mdl$Material_Options$css, 'width', 'auto'),
																			_1: {ctor: '[]'}
																		}
																	},
																	{
																		ctor: '::',
																		_0: A2(
																			_evancz$elm_markdown$Markdown$toHtml,
																			{ctor: '[]'},
																			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_debois$elm_mdl$Material_Card$media,
																		{
																			ctor: '::',
																			_0: _debois$elm_mdl$Material_Color$background(
																				A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Grey, _debois$elm_mdl$Material_Color$S100)),
																			_1: {
																				ctor: '::',
																				_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '16px'),
																				_1: {ctor: '[]'}
																			}
																		},
																		{
																			ctor: '::',
																			_0: A2(
																				_debois$elm_mdl$Material_List$li,
																				{
																					ctor: '::',
																					_0: A2(
																						_debois$elm_mdl$Material_Options$when,
																						_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Tablet) || _elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop),
																						_debois$elm_mdl$Material_List$withBody),
																					_1: {ctor: '[]'}
																				},
																				{
																					ctor: '::',
																					_0: A2(
																						_debois$elm_mdl$Material_List$content,
																						{ctor: '[]'},
																						{
																							ctor: '::',
																							_0: A2(
																								_debois$elm_mdl$Material_List$avatarImage,
																								'adware.png',
																								{ctor: '[]'}),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Enviado por Anônimo'),
																								_1: {
																									ctor: '::',
																									_0: A2(
																										_debois$elm_mdl$Material_List$body,
																										{
																											ctor: '::',
																											_0: A2(
																												_debois$elm_mdl$Material_Options$when,
																												_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Phone),
																												A2(_debois$elm_mdl$Material_Options$css, 'display', 'none')),
																											_1: {ctor: '[]'}
																										},
																										{
																											ctor: '::',
																											_0: _elm_lang$html$Html$text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
																											_1: {ctor: '[]'}
																										}),
																									_1: {ctor: '[]'}
																								}
																							}
																						}),
																					_1: {ctor: '[]'}
																				}),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Page_Schedule$resultView = function (model) {
	var schedulePage = model.pages.schedule;
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{ctor: '[]'});
};
var _egvelho$cibertexto_website_elm$Page_Schedule$mountDayOption = function (day_) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(day_.monthday),
		A2(
			_elm_lang$core$Basics_ops['++'],
			' de ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_egvelho$cibertexto_website_elm$Generics$monthToString(day_.month),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					_egvelho$cibertexto_website_elm$Generics$weekdayToString(day_.weekday)))));
};
var _egvelho$cibertexto_website_elm$Page_Schedule$dateChooser = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		function () {
			var schedulePage = model.pages.schedule;
			return _elm_lang$core$Native_Utils.eq(schedulePage.scheduleLoading, true) ? {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$div,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$center,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Spinner$spinner(
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Spinner$active(schedulePage.scheduleLoading),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			} : (_elm_lang$core$Native_Utils.eq(schedulePage.scheduleLoadError, true) ? {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$div,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Options$center,
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A3(
							_debois$elm_mdl$Material_Options$styled,
							_elm_lang$html$Html$p,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Typography$body2,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Ops! Ocorreu algum problema'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Button$render,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 40,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Button$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Button$raised,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Options$onClick(_egvelho$cibertexto_website_elm$Types$LoadSchedulingSchedulePage),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-top', '16px'),
												_1: {
													ctor: '::',
													_0: A2(_debois$elm_mdl$Material_Options$css, 'margin-bottom', '16px'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Tentar novamente'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			} : (_elm_lang$core$Native_Utils.eq(schedulePage.day.monthday, 0) ? {
				ctor: '::',
				_0: A5(
					_debois$elm_mdl$Material_Select$render,
					_egvelho$cibertexto_website_elm$Types$Mdl,
					{
						ctor: '::',
						_0: 20,
						_1: {ctor: '[]'}
					},
					model.mdl,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Select$label('Escolha o dia'),
						_1: {
							ctor: '::',
							_0: _debois$elm_mdl$Material_Select$below,
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Select$floatingLabel,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Select$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Select$value(
											_elm_lang$core$Native_Utils.eq(schedulePage.day.monthday, 0) ? '' : _egvelho$cibertexto_website_elm$Page_Schedule$mountDayOption(schedulePage.day)),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					},
					A2(
						_elm_lang$core$List$map,
						function (day_) {
							return A2(
								_debois$elm_mdl$Material_Select$item,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Dropdown_Item$onSelect(
										_egvelho$cibertexto_website_elm$Types$SelectDaySchedulePage(day_)),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										_egvelho$cibertexto_website_elm$Page_Schedule$mountDayOption(day_)),
									_1: {ctor: '[]'}
								});
						},
						schedulePage.scheduling)),
				_1: {ctor: '[]'}
			} : {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Chip$span,
					{
						ctor: '::',
						_0: _debois$elm_mdl$Material_Chip$deleteClick(
							_egvelho$cibertexto_website_elm$Types$SelectDaySchedulePage(
								A5(
									_egvelho$cibertexto_website_elm$Types$DayScheduling,
									{ctor: '[]'},
									0,
									0,
									0,
									0))),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'margin', '4px'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A3(
							_debois$elm_mdl$Material_Chip$contact,
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$background(_debois$elm_mdl$Material_Color$primary),
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
									_1: {
										ctor: '::',
										_0: A2(_debois$elm_mdl$Material_Options$css, 'font-size', '14px'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									A2(
										_elm_lang$core$String$left,
										3,
										_egvelho$cibertexto_website_elm$Generics$monthToString(schedulePage.day.month))),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Chip$content,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										_egvelho$cibertexto_website_elm$Page_Schedule$mountDayOption(schedulePage.day)),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Native_Utils.eq(schedulePage.time, 0) ? A5(
						_debois$elm_mdl$Material_Select$render,
						_egvelho$cibertexto_website_elm$Types$Mdl,
						{
							ctor: '::',
							_0: 20,
							_1: {ctor: '[]'}
						},
						model.mdl,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Select$label('Escolha o horário'),
							_1: {
								ctor: '::',
								_0: _debois$elm_mdl$Material_Select$floatingLabel,
								_1: {
									ctor: '::',
									_0: _debois$elm_mdl$Material_Select$ripple,
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Select$value(
											_elm_lang$core$Native_Utils.eq(schedulePage.time, 0) ? '' : A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(schedulePage.time),
												' horas')),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
											_1: {
												ctor: '::',
												_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$List$map,
							function (hour_) {
								return A2(
									_debois$elm_mdl$Material_Select$item,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Dropdown_Item$onSelect(
											_egvelho$cibertexto_website_elm$Types$SelectTimeSchedulePage(hour_)),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(hour_),
												' horas')),
										_1: {ctor: '[]'}
									});
							},
							schedulePage.day.hours)) : A2(
						_debois$elm_mdl$Material_Chip$span,
						{
							ctor: '::',
							_0: _debois$elm_mdl$Material_Chip$deleteClick(
								_egvelho$cibertexto_website_elm$Types$SelectTimeSchedulePage(0)),
							_1: {
								ctor: '::',
								_0: A2(_debois$elm_mdl$Material_Options$css, 'margin', '4px'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_debois$elm_mdl$Material_Chip$contact,
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Color$background(_debois$elm_mdl$Material_Color$accent),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$white),
										_1: {
											ctor: '::',
											_0: A2(_debois$elm_mdl$Material_Options$css, 'font-size', '14px'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										A2(
											_elm_lang$core$String$left,
											3,
											_egvelho$cibertexto_website_elm$Generics$weekdayToString(schedulePage.day.weekday))),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Chip$content,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'Às ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_elm_lang$core$Basics$toString(schedulePage.time),
													' horas'))),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			}));
		}());
};
var _egvelho$cibertexto_website_elm$Page_Schedule$addressError = function (address) {
	return _elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(address),
		8) < 0;
};
var _egvelho$cibertexto_website_elm$Page_Schedule$phoneError = function (phone) {
	var _p0 = _elm_lang$core$String$toInt(phone);
	if (_p0.ctor === 'Err') {
		return true;
	} else {
		return false;
	}
};
var _egvelho$cibertexto_website_elm$Page_Schedule$phoneLengthError = function (phone) {
	return _elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(phone),
		8) < 0;
};
var _egvelho$cibertexto_website_elm$Page_Schedule$nameError = function (name) {
	return _elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(name),
		3) < 0;
};
var _egvelho$cibertexto_website_elm$Page_Schedule$disableSubmit = function (model) {
	var schedule = model.pages.schedule;
	return _egvelho$cibertexto_website_elm$Page_Schedule$nameError(schedule.name) || (_egvelho$cibertexto_website_elm$Page_Schedule$phoneLengthError(schedule.phone) || (_egvelho$cibertexto_website_elm$Page_Schedule$phoneError(schedule.phone) || ((_egvelho$cibertexto_website_elm$Page_Schedule$addressError(schedule.address) && _elm_lang$core$Native_Utils.eq(schedule.place, 2)) || (_elm_lang$core$Native_Utils.eq(schedule.day.monthday, 0) || _elm_lang$core$Native_Utils.eq(schedule.time, 0)))));
};
var _egvelho$cibertexto_website_elm$Page_Schedule$scheduler = F2(
	function (model, texts) {
		return A2(
			_debois$elm_mdl$Material_Card$view,
			{
				ctor: '::',
				_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '100%'),
				_1: {
					ctor: '::',
					_0: A2(_debois$elm_mdl$Material_Options$css, 'overflow', 'initial'),
					_1: {
						ctor: '::',
						_0: _debois$elm_mdl$Material_Elevation$e8,
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Card$title,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$head,
							{
								ctor: '::',
								_0: _debois$elm_mdl$Material_Color$text(_debois$elm_mdl$Material_Color$accent),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(texts.title),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$subhead,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(texts.subtitle),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_debois$elm_mdl$Material_Card$text,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A5(
								_debois$elm_mdl$Material_Textfield$render,
								_egvelho$cibertexto_website_elm$Types$Mdl,
								{
									ctor: '::',
									_0: 7,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _debois$elm_mdl$Material_Textfield$label('Seu nome'),
									_1: {
										ctor: '::',
										_0: _debois$elm_mdl$Material_Textfield$floatingLabel,
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Textfield$maxlength(35),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$when,
													_egvelho$cibertexto_website_elm$Page_Schedule$nameError(model.pages.schedule.name) && (!_elm_lang$core$String$isEmpty(model.pages.schedule.name)),
													_debois$elm_mdl$Material_Textfield$error('Precisa ter pelo menos 3 letras')),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Options$onInput(_egvelho$cibertexto_website_elm$Types$UpdateNameSchedulePage),
													_1: {
														ctor: '::',
														_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A5(
									_debois$elm_mdl$Material_Textfield$render,
									_egvelho$cibertexto_website_elm$Types$Mdl,
									{
										ctor: '::',
										_0: 8,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Textfield$label('Seu celular'),
										_1: {
											ctor: '::',
											_0: _debois$elm_mdl$Material_Textfield$floatingLabel,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Textfield$maxlength(12),
												_1: {
													ctor: '::',
													_0: A2(
														_debois$elm_mdl$Material_Options$when,
														_egvelho$cibertexto_website_elm$Page_Schedule$phoneError(model.pages.schedule.phone) && (!_elm_lang$core$String$isEmpty(model.pages.schedule.phone)),
														_debois$elm_mdl$Material_Textfield$error('Somente números são permitidos')),
													_1: {
														ctor: '::',
														_0: A2(
															_debois$elm_mdl$Material_Options$when,
															_egvelho$cibertexto_website_elm$Page_Schedule$phoneLengthError(model.pages.schedule.phone) && (!_elm_lang$core$String$isEmpty(model.pages.schedule.phone)),
															_debois$elm_mdl$Material_Textfield$error('Precisa ter pelo menos 8 números')),
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Options$onInput(_egvelho$cibertexto_website_elm$Types$UpdatePhoneSchedulePage),
															_1: {
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Card$text,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A3(
									_debois$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _debois$elm_mdl$Material_Typography$headline,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(texts.place),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A5(
										_debois$elm_mdl$Material_Toggles$radio,
										_egvelho$cibertexto_website_elm$Types$Mdl,
										{
											ctor: '::',
											_0: 0,
											_1: {ctor: '[]'}
										},
										model.mdl,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Toggles$ripple,
											_1: {
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$value(
													_elm_lang$core$Native_Utils.eq(model.pages.schedule.place, 0)),
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Toggles$group('schedulePlace'),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$onToggle(
															_egvelho$cibertexto_website_elm$Types$TogglePlaceSchedulePage(0)),
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
															_1: {
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'block'),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Endereço A'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A5(
											_debois$elm_mdl$Material_Toggles$radio,
											_egvelho$cibertexto_website_elm$Types$Mdl,
											{
												ctor: '::',
												_0: 1,
												_1: {ctor: '[]'}
											},
											model.mdl,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Toggles$ripple,
												_1: {
													ctor: '::',
													_0: _debois$elm_mdl$Material_Toggles$value(
														_elm_lang$core$Native_Utils.eq(model.pages.schedule.place, 1)),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Toggles$group('schedulePlace'),
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Options$onToggle(
																_egvelho$cibertexto_website_elm$Types$TogglePlaceSchedulePage(1)),
															_1: {
																ctor: '::',
																_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'block'),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Endereço B'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A5(
												_debois$elm_mdl$Material_Toggles$radio,
												_egvelho$cibertexto_website_elm$Types$Mdl,
												{
													ctor: '::',
													_0: 2,
													_1: {ctor: '[]'}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Toggles$ripple,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Toggles$value(
															_elm_lang$core$Native_Utils.eq(model.pages.schedule.place, 2)),
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Toggles$group('schedulePlace'),
															_1: {
																ctor: '::',
																_0: _debois$elm_mdl$Material_Options$onToggle(
																	_egvelho$cibertexto_website_elm$Types$TogglePlaceSchedulePage(2)),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'height', 'auto'),
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'display', 'block'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Endereço C'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: function () {
													var _p1 = model.pages.schedule.place;
													switch (_p1) {
														case 0:
															return A3(
																_debois$elm_mdl$Material_Options$styled,
																_elm_lang$html$Html$p,
																{
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Typography$body2,
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'padding-top', '8px'),
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('Endereço A'),
																	_1: {ctor: '[]'}
																});
														case 1:
															return A3(
																_debois$elm_mdl$Material_Options$styled,
																_elm_lang$html$Html$p,
																{
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Typography$body2,
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'padding-top', '8px'),
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('Endereço B'),
																	_1: {ctor: '[]'}
																});
														case 2:
															return A5(
																_debois$elm_mdl$Material_Textfield$render,
																_egvelho$cibertexto_website_elm$Types$Mdl,
																{
																	ctor: '::',
																	_0: 3,
																	_1: {ctor: '[]'}
																},
																model.mdl,
																{
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Textfield$label('Informe o endereço'),
																	_1: {
																		ctor: '::',
																		_0: _debois$elm_mdl$Material_Textfield$floatingLabel,
																		_1: {
																			ctor: '::',
																			_0: _debois$elm_mdl$Material_Textfield$maxlength(127),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_debois$elm_mdl$Material_Options$when,
																					_egvelho$cibertexto_website_elm$Page_Schedule$addressError(model.pages.schedule.address) && (!_elm_lang$core$String$isEmpty(model.pages.schedule.address)),
																					_debois$elm_mdl$Material_Textfield$error('Precisa ter pelo menos 8 letras')),
																				_1: {
																					ctor: '::',
																					_0: _debois$elm_mdl$Material_Options$onInput(_egvelho$cibertexto_website_elm$Types$UpdateAddressSchedulePage),
																					_1: {
																						ctor: '::',
																						_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
																						_1: {
																							ctor: '::',
																							_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}
																},
																{ctor: '[]'});
														default:
															return _elm_lang$html$Html$text('');
													}
												}(),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_debois$elm_mdl$Material_Card$text,
								{
									ctor: '::',
									_0: A2(_debois$elm_mdl$Material_Options$css, 'overflow', 'initial'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A3(
										_debois$elm_mdl$Material_Options$styled,
										_elm_lang$html$Html$p,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Typography$headline,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Quando fica bom para você?'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: _egvelho$cibertexto_website_elm$Page_Schedule$dateChooser(model),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_debois$elm_mdl$Material_Card$text,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A3(
											_debois$elm_mdl$Material_Options$styled,
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _debois$elm_mdl$Material_Typography$headline,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(texts.obs),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A5(
												_debois$elm_mdl$Material_Textfield$render,
												_egvelho$cibertexto_website_elm$Types$Mdl,
												{
													ctor: '::',
													_0: 6,
													_1: {ctor: '[]'}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Textfield$label('Escreva aqui'),
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Textfield$textarea,
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Textfield$maxlength(127),
															_1: {
																ctor: '::',
																_0: _debois$elm_mdl$Material_Options$onInput(_egvelho$cibertexto_website_elm$Types$UpdateObsSchedulePage),
																_1: {
																	ctor: '::',
																	_0: A2(_debois$elm_mdl$Material_Options$css, 'width', '90%'),
																	_1: {
																		ctor: '::',
																		_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '512px'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_debois$elm_mdl$Material_Options$div,
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Options$center,
														_1: {
															ctor: '::',
															_0: A2(_debois$elm_mdl$Material_Options$css, 'flex-direction', 'column'),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Spinner$spinner(
															{
																ctor: '::',
																_0: _debois$elm_mdl$Material_Spinner$active(model.pages.schedule.resultLoading),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: ((!model.pages.schedule.resultLoading) && _elm_lang$core$Native_Utils.eq(model.pages.schedule.time, 0)) ? A3(
																_debois$elm_mdl$Material_Options$styled,
																_elm_lang$html$Html$p,
																{
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Typography$body2,
																	_1: {
																		ctor: '::',
																		_0: _debois$elm_mdl$Material_Color$text(
																			A2(_debois$elm_mdl$Material_Color$color, _debois$elm_mdl$Material_Color$Red, _debois$elm_mdl$Material_Color$S500)),
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: function () {
																		var _p2 = model.pages.schedule.result.status;
																		switch (_p2) {
																			case 'unavailable':
																				return _elm_lang$html$Html$text('Ops! Parece que este horário foi ocupado enquanto você escolhia.\n                              Por favor, agende outro horário.');
																			case 'error':
																				return _elm_lang$html$Html$text('Houve um problema de conexão. Por favor, tente novamente.');
																			default:
																				return _elm_lang$html$Html$text('');
																		}
																	}(),
																	_1: {ctor: '[]'}
																}) : _elm_lang$html$Html$text(''),
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_debois$elm_mdl$Material_Card$actions,
										{
											ctor: '::',
											_0: _debois$elm_mdl$Material_Card$border,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A5(
												_debois$elm_mdl$Material_Button$render,
												_egvelho$cibertexto_website_elm$Types$Mdl,
												{
													ctor: '::',
													_0: 4,
													_1: {ctor: '[]'}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _debois$elm_mdl$Material_Button$accent,
													_1: {
														ctor: '::',
														_0: _debois$elm_mdl$Material_Button$ripple,
														_1: {
															ctor: '::',
															_0: _egvelho$cibertexto_website_elm$Route$linkTo(texts.page),
															_1: {ctor: '[]'}
														}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Voltar'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A5(
													_debois$elm_mdl$Material_Button$render,
													_egvelho$cibertexto_website_elm$Types$Mdl,
													{
														ctor: '::',
														_0: 5,
														_1: {ctor: '[]'}
													},
													model.mdl,
													{
														ctor: '::',
														_0: _debois$elm_mdl$Material_Button$accent,
														_1: {
															ctor: '::',
															_0: _debois$elm_mdl$Material_Button$ripple,
															_1: {
																ctor: '::',
																_0: A2(
																	_debois$elm_mdl$Material_Options$when,
																	_egvelho$cibertexto_website_elm$Page_Schedule$disableSubmit(model),
																	_debois$elm_mdl$Material_Button$disabled),
																_1: {
																	ctor: '::',
																	_0: _debois$elm_mdl$Material_Options$onClick(_egvelho$cibertexto_website_elm$Types$SendOrderSchedulePage),
																	_1: {ctor: '[]'}
																}
															}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Confirmar'),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
	});
var _egvelho$cibertexto_website_elm$Page_Schedule$backgroundImage = _debois$elm_mdl$Material_Options$stylesheet('\n      body {\n        background-image: url(\"schedule-background.svg\");\n        background-size: cover;\n        background-repeat: no-repeat;\n        background-position: top;\n      }\n    ');
var _egvelho$cibertexto_website_elm$Page_Schedule$getTexts = function (model) {
	var _p3 = model.pages.schedule.order;
	switch (_p3.ctor) {
		case 'DevelopmentOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/dev'};
		case 'LawyerOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/advogados'};
		case 'FormatOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'ProgramProblemOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'TrollProgramOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'StartupProblemOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'LostFilesOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'SlowProblemOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'NewProgramOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'BackupOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		case 'VirusOrder':
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
		default:
			return {title: 'Eiusmod tempor incididunt!', subtitle: 'Eiusmod tempor incididunt.', place: 'Eiusmod tempor incididunt', obs: 'Eiusmod tempor incididunt?', page: '#/assistencia'};
	}
};
var _egvelho$cibertexto_website_elm$Page_Schedule$render = function (model) {
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _egvelho$cibertexto_website_elm$Page_Schedule$backgroundImage,
			_1: {
				ctor: '::',
				_0: A2(
					_debois$elm_mdl$Material_Options$div,
					{
						ctor: '::',
						_0: A2(
							_debois$elm_mdl$Material_Options$css,
							'margin',
							_elm_lang$core$Native_Utils.eq(model.viewport, _egvelho$cibertexto_website_elm$Types$Desktop) ? '40px' : '16px'),
						_1: {
							ctor: '::',
							_0: A2(_debois$elm_mdl$Material_Options$css, 'max-width', '640px'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_egvelho$cibertexto_website_elm$Page_Schedule$scheduler,
							model,
							_egvelho$cibertexto_website_elm$Page_Schedule$getTexts(model)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _egvelho$cibertexto_website_elm$Page_Schedule$Texts = F5(
	function (a, b, c, d, e) {
		return {title: a, subtitle: b, place: c, obs: d, page: e};
	});

var _egvelho$cibertexto_website_elm$View$renderPage = function (model) {
	var pageContent = function () {
		var _p0 = model.currentPage;
		switch (_p0.ctor) {
			case 'Home':
				return _egvelho$cibertexto_website_elm$Page_Home$render(model);
			case 'TechSupport':
				return _egvelho$cibertexto_website_elm$Page_TechSupport$render(model);
			case 'Order':
				return _egvelho$cibertexto_website_elm$Page_Order$render(model);
			case 'Lawyers':
				return _egvelho$cibertexto_website_elm$Page_Lawyers$render(model);
			case 'Development':
				return _egvelho$cibertexto_website_elm$Page_Development$render(model);
			case 'About':
				return _egvelho$cibertexto_website_elm$Page_About$render(model);
			default:
				return _egvelho$cibertexto_website_elm$Page_Schedule$render(model);
		}
	}();
	return A2(
		_debois$elm_mdl$Material_Options$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: pageContent,
			_1: {ctor: '[]'}
		});
};
var _egvelho$cibertexto_website_elm$View$view = function (model) {
	return A4(
		_debois$elm_mdl$Material_Layout$render,
		_egvelho$cibertexto_website_elm$Types$Mdl,
		model.mdl,
		{
			ctor: '::',
			_0: _debois$elm_mdl$Material_Layout$fixedHeader,
			_1: {ctor: '[]'}
		},
		{
			header: _egvelho$cibertexto_website_elm$View_Header$render(model),
			drawer: _egvelho$cibertexto_website_elm$View_Drawer$render(model),
			tabs: {
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			main: {
				ctor: '::',
				_0: _egvelho$cibertexto_website_elm$View$renderPage(model),
				_1: {ctor: '[]'}
			}
		});
};

var _egvelho$cibertexto_website_elm$Main$main = A2(
	_elm_lang$navigation$Navigation$program,
	_egvelho$cibertexto_website_elm$Route$lookFor,
	{init: _egvelho$cibertexto_website_elm$Model$init, update: _egvelho$cibertexto_website_elm$Update$update, subscriptions: _egvelho$cibertexto_website_elm$Subscriptions$subscriptions, view: _egvelho$cibertexto_website_elm$View$view})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _egvelho$cibertexto_website_elm$Main$main !== 'undefined') {
    _egvelho$cibertexto_website_elm$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

