
### Interface

```typescript title="Parameters"
interface useList<ListItem> {
  (
      key: string,                          // unique key for list
      initialValue?: ListItem[],            // initial list
      listOptions?: ListOptions<ListItem>   // additional list configuration
  ): UseListApi<ListItem>
}

type ListOptions<ListItem> = {
    prepend?: boolean;                // add new elements at the beginning of the list
    unique?: boolean;                 // ensure the uniqueness of elements in the list
    skipIfExist?: boolean;            // skip list update if element exists on the list (see "areEqual")
    areEqual?: EqualityFn<ListItem>;  // comparison function between two elements of the list
};

interface EqualityFn<ListItem> {
    (t1: ListItem, t2: ListItem): boolean;
}
```

```typescript title="Returned value"
type UseListApi<ListItem> = [
    list: ListItem[],
    addItem: (listItem: ListItem) => void,
    removeItem: (listItem: ListItem) => void,
    setList: SetValue<ListItem[]>,
];

interface SetValue<List> {
  (value: List): void;
  (valueFn: (oldValue: List) => List): void;
}
```

### Adding items

#### Append or prepend? 
As default, new items are added at the end of the list.<br/>
With `prepend` option you can add new items at the beginning of the list.


=== "appending items"
    ```typescript title="New items are added at the end of the list (default behavior)"
    const [list, addItem] = useList<string>('key', ['a', 'b', 'c']);
    
                    // list: ['a', 'b', 'c']
    addItem('b');   // list: ['a', 'b', 'c', 'b']
    addItem('x');   // list: ['a', 'b', 'c', 'b', 'x']
    ```
=== "prepending items"
    ```typescript title="New items are added at the beginning of the list"
    const listOptions: ListOptions<string> = { prepend: true };
    const [list, addItem] = useList<string>('key', ['a', 'b', 'c'], listOptions);
    
                    // list: ['a', 'b', 'c']
    addItem('b');   // list: ['b', 'a', 'b', 'c']
    addItem('x');   // list: ['x', 'b', 'a', 'b', 'c']
    ```

---
#### Uniqueness check
The `unique` option enables a mechanism ensuring the uniqueness of elements in a list.

When activated, attempting to add an element that already exists on the list results 
in the removal of the existing element and the addition of the new one at the beginning/end of the list.

It means that new items are **always** added to the list, and existing ones are **always** removed.

!!! info ""areEqual" function"
    Uniqueness check is done using the "areEqual" function. 
    By default, function performs shallow comparison between two list items`(a: ListItem, b: ListItem) => a === b;`.
    You can modify this behavior by defining your own comparison function in the "ListOptions.areEqual" parameter.

=== "simple list items"
    ```typescript
    const listOptions: ListOptions<string> = { unique: true };
    const [list, addItem] = useList<string>('some-key', ['a', 'b', 'c'], listOptions);
    
                        // list: ['a', 'b', 'c']
    addItem('a');       // list: ['b', 'c', 'a']
    addItem('x');       // list: ['b', 'c', 'a', 'x']
    addItem(list[0]);   // list: ['c', 'a', 'x', 'b']
    ```
=== "complex list items"
    ```typescript title="Default comparison function"
    type Item = { id: string; }

    const listOptions: ListOptions<Item> = { unique: true };
    const initialValue = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }];
    const [list, addItem] = useList<Item>('some-key', initialValue, listOptions);

                                    // list: [{ id: 'a', v: 1 }, { id: 'b', v: 2 }}]
    addItem({ id: 'a', v: 11 });    // list: [{ id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'a', v: 11 }]
    addItem({ id: 'x', v: 22 });    // list: [{ id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'a', v: 11 }, { id: 'x', v: 22 }]
    addItem(list[0]);               // list: [{ id: 'b', v: 2 }, { id: 'a', v: 11 }, { id: 'x', v: 22 }, { id: 'a', v: 1 }]
    ```

    ```typescript title="Custom &quot;areEqual&quot; function"
    type Item = { id: string; }

    const listOptions: ListOptions<Item> = {
        unique: true,
        areEqual: (a: Item, b: Item) => a.id === b.id
    };
    const initialValue = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }];
    const [list, addItem] = useList<Item>('some-key', initialValue, listOptions);

                                    // list: [{ id: 'a', v: 1 }, { id: 'b', v: 2 }]
    addItem({ id: 'a', v: 11 });    // list: [{ id: 'b', v: 2 }, { id: 'a', v: 11 }]
    addItem({ id: 'x', v: 22 });    // list: [{ id: 'b', v: 2 }, { id: 'a', v: 11 }, { id: 'x', v: 22 }]
    addItem(list[0]);               // list: [{ id: 'a', v: 11 }, { id: 'x', v: 22 }, { id: 'b', v: 2 }]
    ```
With `skipIfExist` option you can change this behavior.

By default, `unique` option is set to the "replace" mode. However, it can be customized with the
additional `skipIfExist` option. When this option is enabled, attempting to add an existing
element does not affect the list, and the operation is ignored.

=== "simple list items" 
    ```typescript
    const listOptions: ListOptions<string> = { unique: true, skipIfExist: true };
    const [, addItem] = useList<string>('some-key', ['a', 'b', 'c'], listOptions);

                    // list: ['a', 'b', 'c']
    addItem('b');   // list: ['a', 'b', 'c']
    addItem('x');   // list: ['a', 'b', 'c', 'x']    
    ```
=== "complex list items"
    ```typescript
    type Item = { id: string; text: string; }

    const listOptions: ListOptions<Item> = {
        unique: true,
        skipIfExist: true,
        areEqual: (a: Item, b: Item) => a.id === b.id
    };
    const initialValue = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const [list, addItem] = useList<Item>('some-key', initialValue, listOptions);

                    // list: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    addItem('b');   // list: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    addItem('x');   // list: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'x' }]
    ```

---
### Removing items
#### Remove item

=== "simple list items"
    ```typescript
    const [list,, removeItem] = useList<string>('some-key', ['a', 'b', 'c']);
    
                        // list: ['a', 'b', 'c']
    removeItem('b');    // list: ['a', 'c']
    removeItem('x');    // list: ['a', 'c']  
    ```
=== "complex list items"
    ```typescript
    type Item = { id: string, text: string };
    
    const listOptions = {
        areEqual: (a: Item, b: Item) => a.id === b.id
    }
    const initialValue = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const [list,, removeItem] = useList<Item>('key', initialValue, listOptions);
    
                                // list: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    removeItem({ id: 'b' });    // list: [{ id: 'a' }, { id: 'c' }]
    removeItem({ id: 'x' });    // list: [{ id: 'a' }, { id: 'c' }]
    ```

### Setting new list
#### Directly
You can set new list by calling `setList` with new list parameter.
```typescript
const [list,,, setList] = useList<string>('some-key', ['a', 'b', 'c']);

                      // list: ['a', 'b', 'c']
setList(['x', 'y']);  // list: ['x', 'y']
setList(['a']);       // list: ['a']
```
#### By callback
If value provided to `setList` is a function, it will be called with _oldValue_ parameter, 
and returned value from this function will be set as new list. 

With this mechanism you can resolve new value based on old value.
```typescript
const [,,, setList] = useList<string>('some-key', []);

const setNewListIfEmpty = (newList: string[]) => 
    setList((oldList: string[]) => {
        return (oldList.length > 0) ? oldList : newList;
    }
);
                                // list: []
setNewListIfEmpty(['x', 'y']);  // list: ['x', 'y']
setNewListIfEmpty(['a']);       // list: ['x', 'y']
```
