---
title: ArrayList源码浅析
tags: JDK集合类
categories: 源码浅析
date: 2017-11-08 20:13:06
---
探究JDK8中ArrayList源码
<!-- more -->

## 沿着boolean add(E e)方法探究内部实现

源码如下：
```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```
可以看到，首先调用`ensureCapacityInternal`方法确保内部容量足够，然后对`elementData`数组最后一位赋值。不看具体的扩容方法，我们能知道`ArrayList`内部为数组实现。

下面看看是如何扩容的：
```java
private void ensureCapacityInternal(int minCapacity) {
    // 如果内部数组elementData为默认的空数组DEFAULTCAPACITY_EMPTY_ELEMENTDATA，
    // 则minCapacity为默认容量DEFAULT_CAPACITY和minCapacity之间较大的数
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }

    ensureExplicitCapacity(minCapacity);
}

private void ensureExplicitCapacity(int minCapacity) {
    modCount++; // 修改计数器加一

    // overflow-conscious code 如果minCapacity比内部数组elementData的长度大，则扩容
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}

/**
 * The maximum size of array to allocate.
 * Some VMs reserve some header words in an array.
 * Attempts to allocate larger arrays may result in
 * OutOfMemoryError: Requested array size exceeds VM limit
 */
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

/**
 * Increases the capacity to ensure that it can hold at least the
 * number of elements specified by the minimum capacity argument.
 *
 * @param minCapacity the desired minimum capacity
 */
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length; // 原数组的长度
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 扩容长度为1.5倍
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity); // 扩容
}

private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```
顺着方法一路往下看，我们能知道：
* 首先`minCapacity = size + 1`
* 如果内部数组为`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`，则`minCapacity`为默认容量`DEFAULT_CAPACITY`和`minCapacity`之间较大的数
* 如果`minCapacity`比内部数组`elementData`的长度大，则扩容`newCapacity = oldCapacity + (oldCapacity >> 1)`
* 如果`newCapacity - minCapacity < 0`，则`newCapacity = minCapacity`，用来保证正确的扩容
* 最后再比较是否超过允许最大的容量

## 看构造函数如何初始化内部数组
源码如下:
```java
public ArrayList(int initialCapacity) {
    // 初始化值大于0，则直接根据给定的值初始化内部数组elementData
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        // 初始化值为0，则赋值为内部empty数组
        // EMPTY_ELEMENTDATA和DEFAULTCAPACITY_EMPTY_ELEMENTDATA虽然都为{}，但后面有骚操作哦
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}

/**
 * Constructs an empty list with an initial capacity of ten.
 */
public ArrayList() {
    // 不指定大小，则赋值为内部默认空容量数组
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

/**
 * Constructs a list containing the elements of the specified
 * collection, in the order they are returned by the collection's
 * iterator.
 *
 * @param c the collection whose elements are to be placed into this list
 * @throws NullPointerException if the specified collection is null
 */
public ArrayList(Collection<? extends E> c) {
    elementData = c.toArray();
    if ((size = elementData.length) != 0) {
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elementData.getClass() != Object[].class)
            elementData = Arrays.copyOf(elementData, size, Object[].class);
    } else {
        // replace with empty array.
        this.elementData = EMPTY_ELEMENTDATA;
    }
}
```
从中我们能进一步了解：
* 如果我们用无参构造函数初始化，则内部数组`this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA`
* 当首次调用add方法时，则`ensureCapacityInternal`中判断语句`elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA`成立，`minCapacity`被赋值`minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity)`，即`minCapacity`赋值为10，`grow`方法最终将内部数组容量扩充为10

*扩展：如果调用ArrayList(0)进行初始化，然后首次调用add方法时和上面相同吗？*

**结果显然不是**：
* 调用`ArrayList(0)`进行初始化，构造函数中`this.elementData = EMPTY_ELEMENTDATA`，而`EMPTY_ELEMENTDATA`和`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`虽然都为`{}`，但为不同的对象
* 当首次调用`add`方法时，`ensureCapacityInternal`中判断语句`elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA`不成立，`minCapacity`不执行`minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity)`，即`minCapacity`为1，`grow`方法中`newCapacity`的条件`newCapacity - minCapacity < 0`成立，执行`newCapacity = minCapacity`，最终内部数组扩充为1

## 移除元素会不会缩容呢

源码如下：
```java
public E remove(int index) {
    rangeCheck(index);

    modCount++;
    E oldValue = elementData(index);

    // 删除元素（不包括）到最后一个元素之间的元素个数
    int numMoved = size - index - 1;
    if (numMoved > 0)
        // 相当于elementData数组中从删除元素后面开始均往前移动一个单位，这操作很骚
        System.arraycopy(elementData, index+1, elementData, index,
                         numMoved);
    // 最后删除最后一个元素，size - 1
    elementData[--size] = null; // clear to let GC do its work

    return oldValue;
}
```

**咩？那内部数组就是没有缩容咯！**