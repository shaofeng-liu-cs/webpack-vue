/**
 * Created by xiejiayong on 2017/5/10.
 */

declare namespace ht {
    namespace ShapeType {
        //var shapes = ['rect', 'circle', 'oval', 'roundRect', 'star', 'triangle', 'hexagon', 'pentagon', 'diamond', 'rightTriangle', 'parallelogram', 'trapezoid'];

    }
    export class Notifier {

        /**
         * 增加监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         */

        add(listener, scope, ahead);

        /**
         * 是否包含此监听器函数
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         */
        contains(listener, scope);

        /**
         * 派发事件，依次调用所有的监听器函数
         * @param {Object} event 事件对象
         */
        fire(event);

        /**
         * 删除监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         */
        remove(listener, scope);
    }
    export class List {

        add(item: any, index: number);

        /**
         * 将一批元素加入到当前集合中
         * @param {Array|ht.List} array 元素数组或集合
         */
        addAll(array: any[] | List);

        /**
         * 清空集合
         */
        clear();

        /**
         * 判断当前集合是否包含参数元素
         * @param {Object} item 是否包含此元素
         */
        contains(item: any): boolean

        /**
         * 提供一个回调函数遍历此集合
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example list.each(function(item) {
     *   console.log(item);
     * });
         */
        each(func: any, scope?: any);

        /**
         * 返回索引位置的的元素
         * @param {Number} index 索引
         * @return {Object} 处于索引位置的元素
         */
        get(index: number): any;

        /**
         * 获取类声明(构造函数)
         * @return {Function} 类声明(构造函数)
         */
        getClass(): any;

        /**
         * 获取类全名
         * @return {String} 类全名
         */
        getClassName(): string;

        /**
         * 获取父类声明(构造函数)
         * @return {Function} 父类声明(构造函数)
         */
        getSuperClass(): any;

        /**
         * 获得参数元素的索引
         * @param {Object} item 元素
         * @return {Number} 元素的索引
         */
        indexOf(item: any): number;

        /**
         * 判断集合是否为空
         * @return {Boolean} 集合是否为空
         */
        isEmpty(): boolean;

        /**
         * 将参数元素从集合中删除
         * @param {Object} item 要删除的元素
         * @return {Number} 要删除的元素的索引
         */
        remove(item: any): number;

        /**
         * 删除索引位置的元素
         * @param {Number} index 要删除的索引
         * @return {Ojbect} 删除的元素
         */
        removeAt(index: number): any;

        /**
         * 将集合中的元素顺序倒序排序
         */
        reverse();

        /**
         * 提供一个回调函数倒序遍历此集合
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example list.reverseEach(function(item) {
     *   console.log(item);
     * });
         */
        reverseEach(func: any, scope: any);

        /**
         * 设置索引处的元素
         * @param {Number} index 索引，如果此索引处存在元素则将其替换
         * @param {Object} item 新元素
         */
        set(index: number, item: any);

        /**
         * 获取集合中的元素数
         * @return {Number} 集合中的元素数
         */
        size();

        /**
         * 提取集合中的部分元素组成一个新集合并返回
         * @param {Number} start 开始索引(包含)
         * @param {Number} end 结束索引(不包含)
         * @return {ht.List} 新集合
         */
        slice(start, end): List;

        /**
         * 根据参数函数将元素排序
         * @param {Function} sortFunc 排序函数
         * @example list.sort(function(item1, item2) {
     *      return item1.age > item2.age;
     * });
         * @return {ht.List} 自身
         */
        sort(sortFunc: any): List;

        /**
         * 以matchFunc为过滤函数构建新的元素数组
         * @param {Function} [matchFunc] 过滤函数
         * @param {Object} [scope] 函数域
         * @example var array = list.toArray(function(item) {
     *    if (item.a('visible')) {
     *    	return true;
     *    }
     * });
         *
         * @return {Array} 元素数组
         */
        toArray(mathFunc, scope): any[];

        /**
         * 以matchFunc为过滤函数构建新的元素集合
         * @param {Function} [matchFunc] 过滤函数
         * @param {Object} [scope] 函数域
         * @example var list = list.toList(function(item) {
     *    if (item.a('visible')) {
     *    	return true;
     *    }
     * });
         *
         * @return {ht.List} 元素集合
         */
        toList(mathFunc, scope): List

        /**
         * 重写js默认的toString
         * @return {String}
         */
    }

    export class Data {

        addChild(child: any, index: number);

        addStyleIcon(name: string, icon: any);

        clearChildren();

        dm(dataModel: ht.DataModel);

        eachChild(func: any, scope: any);

        firePropertyChange(property: string, oldValue: any, newValue: any);

        fp(property: string, oldValue: any, newValue: any);

        getAttrObject();

        /**
         * 返回指定索引位置的孩子
         * @param {Number} index 索引
         * @return {ht.Data} 索引对应的孩子
         */
        getChildAt(index: number): ht.Data

        /**
         * 获取所有孩子节点
         * @return {ht.List} 孩子元素集合
         */
        getChildren(): ht.List;

        /**
         * 获取类声明(构造函数)
         * @return {Function} 类声明(构造函数)
         */
        getClass(): any;

        /**
         * 获取类全名，继承Data并希望序列化时应该重写此方法返回子类的类名字符串
         * @see {@link ht.Data#getSuperClass}
         * @return {String} 类全名
         */
        getClassName(): string;

        /**
         * 获取所属的DataModel
         * @return {ht.DataModel} DataModel数据容器
         */
        getDataModel(): ht.DataModel;

        /**
         * 获取显示名称，常作为Column和Property的列头和属性名称显示
         * @return {String} 显示名称
         */
        getDisplayName(): string;

        /**
         * 获取小图标名称，常作为TreeView和ListView等组件上的节点小图标
         * @return {String|Object} 图标名或矢量
         */
        getIcon(): string | any;

        /**
         * 获取唯一编号
         * @return {Number} 唯一编号
         */
        getId(): number;

        /**
         * 获取数据元素在GraphView组件中的图层位置
         * @default 0
         * @return {String|Number} 图层名
         */
        getLayer(): string | number;

        /**
         * 获取父元素
         * @return {ht.Data} 父元素
         ht.Data.prototype.getParent  = ();
         */
        getParent(): ht.Data;

        /**
         * 获取数据元素名
         * @return {String} 名称
         */
        getName(): string;

        /**
         * 此函数返回一个map，决定序列化时哪些属性可被序列化，如果有自定义的get/set属性并且需要序列化，应该重写此方法
         * @example function(){
     *     return {
     *         name: 1,
     *         displayName: 1,
     *         icon: 1,
     *         toolTip: 1,
     *         parent: 1,
     *         layer: 1,
     *         tag: 1,
     *         adjustChildrenToTop: 1
     *     };
     * }
         * @return {Object} 需要被序列化的属性map
         */
        getSerializableProperties(): any;

        /**
         * 此函数返回一个map，决定序列化时哪些attr属性可被序列化，默认所有attr对象里的属性都会被序列化
         * @example function(){
     *     var name, map = ;
     *     for (name in this._attrObject) {
     *         map[name] = 1;
     *     }
     *     return map;
     * }
         * @return {Object} 需要被序列化的attr属性map
         */
        getSerializableAttrs(): any;

        /**
         * 此函数返回一个map，决定序列化时哪些样式可被序列化，默认所有样式都会被序列化
         * @example function(){
     *     var name, map = ;
     *     for (name in this._styleMap) {
     *         map[name] = 1;
     *     }
     *     return map;
     * }
         * @return {Object} 需要被序列化的样式map
         */
        getSerializableStyles(): any;

        /**
         * 获取或设置attr属性，仅有一个参数时相当于{@link ht.Data#getAttr getAttr}，有两个参数时相当于{@link ht.Data#setAttr setAttr}
         * @param {String} name 属性名
         * @param {Object} [value] 属性值
         * @returns {Object}
         */
        a(name: string, value: any): any;

        /**
         * 获取或设置样式，仅有一个参数时相当于{@link ht.Data#getStyle getStyle}，有两个参数时相当于{@link ht.Data#setStyle setStyle}
         * @param {String} name 样式名
         * @param {Object} [value] 样式值
         * @returns {Object}
         */
        // s(name: string, value: any): any;
        s(p1: any, p2?: any): any;
        /**
         * 获取样式属性
         * @param {String} name 样式名
         * @returns {Object}
         */
        getStyle(name: string): any;
        /**
         * 设置样式
         * @param {String} name 样式名
         * @param {Object} value 样式值
         */
        setStyle(name: string, value: any);

        /**
         * 获取attr属性
         * @param {String} name 属性名
         * @returns {Object}
         */
        getAttr(name: string): any;
        /**
         * 设置attr属性
         * @param {String} name 属性名
         * @param {Object} value 属性值
         */
        setAttr(name: string, value: any);

        /**
         * 获取图元内部样式映射信息
         * @returns {Object} 样式映射表
         */
        getStyleMap(): any;

        /**
         * 获取父类声明(构造函数)，继承类时可以用来调用父类构造或函数
         * @example function MyNode() {
     *      this.getSuperClass().call(this);//调用父类构造函数
     * }
         * ht.Default.def(MyNode, ht.Data, {
     *    setName: function(name) {
     *    	this.getSuperClass().prototype.setName.call(this, name);//调用父类的setName函数
     *    	this._username = name;
     *    }
     * });
         *
         * @returns {Function} 父类声明(构造函数)
         */
        getSuperClass(): any;

        /**
         * 获取标示号，可通过{@link ht.DataModel#getDataByTag getDataByTag}快速查找
         * @returns {String} 标示号
         */
        getTag(): string;

        /**
         * 获取文字提示信息
         * @returns {String} 文字提示
         */
        getToolTip(): string;

        /**
         * 获取拓扑组件上的UI类
         * @returns {Function} UI类声明(构造函数)
         */
        getUIClass(): any;

        /**
         * 判断是否有孩子
         * @returns {Boolean} 是否有孩子
         */
        hasChildren(): boolean;

        /**
         * 强制触发属性变化事件通知界面更新
         */
        invalidate();

        /**
         * GraphView点击图元会自动sendToTop，该属性决定是否对子图元也进行sendToTop操作
         * @return {Boolean} 是否将children自动sendToTop
         */
        isAdjustChildrenToTop(): boolean;

        /**
         * 判断自身是否为指定data的子孙
         * @param {ht.Data} data 要对比的数据元素
         * @return {Boolean} 自身是否为指定data的子孙
         */
        isDescendantOf(data: ht.Data): boolean;

        /**
         * 判断是否有孩子，同{@link ht.Data#hasChildren hasChildren}
         * @return {Boolean} 是否有孩子
         */
        isEmpty(): boolean;

        /**
         * 判断自身是否为指定data的父亲
         * @param {ht.Data} data 要对比的数据元素
         * @return {Boolean} 自身是否为指定data的父亲
         */
        isParentOf(data: ht.Data);

        /**
         * 判断自身与指定data是否有父子或子孙关系
         * @param {ht.Data} data 要对比的数据元素
         * @return {Boolean} 自身与指定data是否有父子或子孙关系
         */
        isRelatedTo(data: ht.Data): boolean;

        /**
         * 强制触发属性变化事件通知界面更新，{@link ht.Data#invalidate invalidate}的缩写
         */
        iv();

        /**
         * 添加孩子时的回调函数，可重载做后续处理
         * @param {ht.Data} child 新增加的孩子元素
         * @param {Number} index 索引
         */
        onChildAdded(child, index);

        /**
         * 删除孩子时的回调函数，可重载做后续处理
         * @param {ht.Data} child 被删除的孩子元素
         * @param {Number} index 索引
         */
        onChildRemoved(child, index);

        /**
         * 改变父亲元素时的回调函数，可重载做后续处理
         * @param {ht.Data} oldParent 旧的父元素
         * @param {ht.Data} parent 新的父元素
         */
        onParentChanged(oldParent: ht.Data, parent: ht.Data);

        /**
         * 属性变化回调函数，可重载做后续处理
         * @param {Object} event 属性变化事件
         * @example //event格式：
         * {
     * 	property: 'name',//发生变化的属性
     * 	oldValue: 'oldValue',//旧值
     * 	newValue: 'newValue',''新值
     * 	data: data//发生变化的data
     * }
         *
         */
        onPropertyChanged(event: any);

        /**
         * 样式属性变化时会回调该函数，可重载做后续处理
         * @param {String} name 样式名
         * @param {Object} oldValue 旧的样式值
         * @param {Object} newValue 新的样式值
         */
        onStyleChanged(name, oldValue, newValue);

        /**
         * 删除指定孩子元素，内部会自动调用孩子元素的setParent
         * @param {ht.Data} child 要删除的孩子元素
         */
        removeChild(child: ht.Data);

        /**
         * 删除icon
         * @param {String} name 要删除的icon名
         */
        removeStyleIcon(name: string);

        /**
         * GraphView点击图元会自动sendToTop，该属性决定是否对子图元也进行sendToTop操作
         * @param {Boolean} adjustToTop 是否将children自动sendToTop
         */
        setAdjustChildrenToTop(adjustToTop: boolean): void;

        /**
         * 设置attr属性对象，该属性默认为空，用于存储用户业务信息
         * @param {Object} attrObject attr属性对象
         */
        setAttrObject(attrObject: any): void;

        /**
         * 设置显示名称，常作为Column和Property的列头和属性名称显示
         * @param {String}  displayName 显示名称
         */
        setDisplayName(displayName: string);

        /**
         * 设置小图标名称，常作为TreeView和ListView等组件上的节点小图标
         * @param {String|Object} icon 图标名或矢量
         */
        setIcon(icon: string | any);

        /**
         * 设置唯一编号，如果手工设置，一定要确保在data加入到DataModel之前设置并且唯一不重复
         * @param {String|Number} id 唯一编号
         */
        setId(id: number);

        /**
         * 设置数据元素在GraphView组件中的图层位置
         * @param {String|Number} layer 图层名
         */
        setLayer(layer: string | number);

        /**
         * 设置数据元素名称
         * @param {String} name 数据元素名称
         */
        setName(name: string);

        /**
         * 设置父元素
         * @param {ht.Data} parent 父元素
         */
        setParent(parent: ht.Data);

        /**
         * 设置标示号，可通过{@link ht.DataModel#getDataByTag getDataByTag}快速查找
         * @param {String} tag 标示号
         */
        setTag(tag: string);
        /**
         * 设置文字提示信息
         * @param {String} toolTip 文字提示
         */
        setToolTip(toolTip: string);

        /**
         * 获取孩子元素总数
         * @return {Number} 孩子元素总数
         */
        size(): number;

        /**
         * 以matchFunc为过滤函数构建新的孩子元素集合
         * @param {Function} [matchFunc] 过滤函数
         * @param {Object} [scope] 函数域
         * @example var list = data.toChildren(function(child) {
     *    if (child.a('visible')) {
     *    	return true;
     *    }
     * });
         *
         * @return {ht.List} 孩子元素集合
         */
        toChildren(matchFunc, scope): ht.List;

        /**
         * 返回值作为TreeView和GraphView等组件上的图元文字标签，默认返回displayName||name信息
         * @return {String} 文字标签
         */
        toLabel(): string;

        /**
         * 重写js默认的toString
         * @return {String}
         ht.Data.prototype.toString  = ();
         */

    }
    export class Node extends Data {

        /**
         * 获取当前图元代理的连线集合
         * @return {ht.List}
         */
        getAgentEdges(): ht.List;

        /**
         * 获取吸附到自身的所有图元
         * @return {ht.List}
         */
        getAttaches(): ht.List;

        /**
         * 获取图元四个角的实时坐标(包括旋转后的坐标)
         * @param {Number} xPadding 水平方向padding
         * @param {Number} yPadding 垂直方向padding
         * @example //返回值示例：
         * [
         * {x: 0, y: 0},//左上
         * {x: 100, y: 0},//右上
         * {x: 100, y: 100},//右下
         * {x: 0, y: 100}//左下
         * ]
         * @return {Array} 四个角坐标，顺序为左上，右上，右下，左下
         */
        getCorners(xPadding, yPadding): any[];

        /**
         * 获取图元中心在3D坐标系中的y坐标
         * @return {Number}
         */
        getElevation(): number;

        /**
         * 获取所有跟图元关联的连线(不包括代理的连线)
         * @return {ht.List}
         */
        getEdges(): ht.List;

        /**
         * 获取图元在2D拓扑中的高度，或3D拓扑中的z轴长度
         * @return {Number}
         */
        getHeight(): number;

        /**
         * 获取宿主图元，当图元吸附上宿主图元时，宿主移动或旋转时会带动所有吸附者
         * @return {ht.Data}
         */
        getHost(): ht.Data;

        /**
         * 获取拓扑上展现的图片信息，在GraphView拓扑图中图片一般以position为中心绘制
         * @return {ht.Data}
         */
        getImage(): ht.Data;

        /**
         * 获取所有跟节点关联的自环连线
         * @return {ht.List}
         */
        getLoopedEdges(): ht.List;

        /**
         * 获取图元中心点坐标
         * @example //返回值示例：
         * {
     * 	x: 0,
     * 	y: 0
     * }
         *
         * @return {Object}
         */
        getPosition(): any;

        /**
         * 获取图元中心点在3D拓扑中的三维坐标
         * @return {Array} 三维坐标数组，格式为[x, y, z]
         */
        getPosition3d(): number[];

        /**
         * 获取图元的矩形区域(包括旋转)
         * @example //返回值示例：
         * {x: 0, y: 0, width: 100, height: 100}
         * @return {Object} 矩形区域
         */
        getRect(): any;

        /**
         * 获取图元的旋转角度，围绕中心点顺时针旋转
         * @return {Number} 旋转角度(弧度制)
         */
        getRotation(): number;

        /**
         * 获取图元在3D拓扑中的三维旋转角度
         * @return {Array} 三维旋转角度(弧度制)，格式为[x, y, z]，即[getRotationX(), -getRotation(), getRotationZ()]
         */
        getRotation3d(): number[];

        /**
         * 返回三维旋转模式<br>
         * 图元在3D拓扑中旋转时，先沿x轴旋转，再沿y轴旋转和先沿y轴旋转，再沿x轴旋转最后的结果是不一样的
         * @return {String} 三维旋转模式，xyz|xzy|yxz|yzx|zxy|zyx
         * @see {@link ht.Node#setRotationMode setRotationMode}
         */
        getRotationMode();

        /**
         * 获取图元在3d拓扑中沿x轴的旋转角度(弧度制)
         * @return {Number}
         */
        getRotationX(): number;

        /**
         * 获取图元在3d拓扑中沿y轴的旋转角度(弧度制)
         * @return {Number}
         */
        getRotationY(): number;

        /**
         * 获取图元在3d拓扑中沿z轴的旋转角度(弧度制)
         * @return {Number}
         */
        getRotationZ(): number;

        /**
         * 获取图元在2D拓扑中的尺寸(宽高)
         * @example //返回值示例：
         * {
     * 	with: 100,
     * 	height: 100
     * }
         * @return {Object}
         */
        getSize(): any;

        /**
         * 获取图元在3D拓扑中的尺寸(长宽高)
         * @return {Array} 格式为[x, y, z]，即[getWidth(), getTall(), getHeight()]
         */
        getSize3d(): number[];

        /**
         * 获取代理的起始于该图元的连线
         * @return {ht.List}
         */
        getSourceAgentEdges(): ht.List;

        /**
         * 获取跟图元关联的并起始于该图元的连线(不包括代理的连线)
         * @return {ht.List}
         */
        getSourceEdges(): ht.List;

        /**
         * 获取图元在3D拓扑中的y轴长度
         * @return {Number}
         */
        getTall(): number;

        /**
         * 获取图元代理的结束于该图元的连线
         * @return {ht.List}
         */
        getTargetAgentEdges(): ht.List;

        /**
         * 获取跟图元关联的并结束于该图元的连线(不包括代理的连线)
         * @return {ht.List}
         */
        getTargetEdges(): ht.List;

        /**
         * 获取图元在2D拓扑中的宽度，或在3D拓扑中x轴的长度
         * @return {Number}
         */
        getWidth(): number;

        /**
         * 当吸附宿主对象属性发生变化时回调该函数，可重载做后续处理
         * @param {Event} event 事件对象
         */
        handleHostPropertyChange(event);

        /**
         * 判断当前图元上是否有代理连线
         * @return {Boolean}
         */
        hasAgentEdges(): boolean;

        /**
         * 判断当前图元是否吸附到指定图元对象上
         * @param {ht.Node} node 指定的图元
         * @return {Boolean}
         */
        isHostOn(node: ht.Node): boolean;

        /**
         * 当吸附的宿主对象发生变化时回调该函数，可重载做后续处理
         * @param {ht.Node} oldHost 旧的宿主
         * @param {ht.Node} newHost 新的宿主
         */
        onHostChanged(oldHost: ht.Node, newHost: ht.Node);

        /**
         * 获取或设置设置图元中心点坐标，有两个参数时相当于{@link ht.Node#setPosition setPosition}，没有参数时相当于{@link ht.Node#getPosition getPosition}
         * @param {Number} [x] x坐标
         * @param {Number} [y] y坐标
         * @see {@link ht.Node#setPosition setPosition}
         * @see {@link ht.Node#getPosition getPosition}
         * @return {Object} 坐标值，格式为:{x: x, y: y}
         */
        p(x: number, y: number): any;

        /**
         * 获取或设置图元中心点在3D拓扑中的三维坐标，有三个参数时相当于{@link ht.Node#setPosition3d setPosition3d}，没有参数时相当于{@link ht.Node#getPosition3d getPosition3d}
         * @param {Number} [x] x坐标
         * @param {Number} [y] y坐标
         * @param {Number} [z] z坐标
         * @see {@link ht.Node#setPosition3d setPosition3d}
         * @see {@link ht.Node#getPosition3d getPosition3d}
         * @return {Array} 三维坐标数组，格式为[x, y, z]
         */
        p3(x, y, z);

        /**
         * 获取或设置图元在3D拓扑中的三维旋转角度，有三个参数时相当于{@link ht.Node#setRotation3d setRotation3d}，没有参数时相当于{@link ht.Node#getRotation3d getRotation3d}
         * @param {Number} [rotationX] 沿x轴的旋转角度(弧度制)
         * @param {Number} [rotationY] 沿y轴的旋转角度(弧度制)
         * @param {Number} [rotationZ] 沿z轴的旋转角度(弧度制)
         * @see {@link ht.Node#setRotation3d setRotation3d}
         * @see {@link ht.Node#getRotation3d getRotation3d}
         * @return {Array} 三维旋转角度(弧度制)，格式为[x, y, z]，即[getRotationX(), -getRotation(), getRotationZ()]
         */
        r3(rotationX, rotationY, rotationZ);

        /**
         * 以指定的坐标为中心旋转图元
         * @param {Number} x 指定x坐标
         * @param {Number} y 指定y坐标
         * @param {Number} angle 旋转角度(弧度制)
         */
        rotateAt(x, y, angle);

        /**
         * 获取或设置图元在3D拓扑中的尺寸，有三个参数时相当于{@link ht.Node#setSize3d setSize3d}，没有参数时相当于{@link ht.Node#getSize3d getSize3d}
         * @param {Number} width x轴方向的长度
         * @param {Number} tall y轴方向的长度
         * @param {Number} height z轴方向的长度
         * @see {@link ht.Node#setSize3d setSize3d}
         * @see {@link ht.Node#getSize3d getSize3d}
         * @return {Array} 格式为[x, y, z]，即[getWidth(), getTall(), getHeight()]
         */
        s3(width, tall, height);

        /**
         * 设置图元中心在3D坐标系中的y坐标
         * @param {Number} elevation y轴方向的坐标值
         */
        setElevation(elevation);

        /**
         * 设置图元在2D拓扑中的高度，或3D拓扑中的z轴长度
         * @param {Number} height 2D拓扑中的高度，或3D拓扑中的z轴长度
         */
        setHeight(height);

        /**
         * 设置宿主图元，当图元吸附上宿主图元时，宿主移动或旋转时会带动所有吸附者
         * @param {ht.Data} data 宿主图元
         */
        setHost(data: ht.Data);

        /**
         * 设置拓扑上展现的图片信息，在GraphView拓扑图中图片一般以position为中心绘制
         * @param {String|Object} image 注册的图片名或url或矢量对象
         */
        setImage(image);

        /**
         * 设置图元中心点坐标
         * @param {Number} x x坐标
         * @param {Number} y y坐标
         */
        setPosition(x, y);

        /**
         * 设置图元中心点在3D拓扑中的三维坐标
         * @param {Number} x x坐标
         * @param {Number} y y坐标
         * @param {Number} z z坐标
         */
        setPosition3d(x, y, z);

        /**
         * 设置图元矩形区域
         * @param {Number} x x坐标
         * @param {Number} y y坐标
         * @param {Number} width 宽度
         * @param {Number} height 高度
         */
        setRect(x, y, width, height);

        /**
         * 设置图元的旋转角度，围绕中心点顺时针旋转
         * @param {Number} rotation 旋转角度(弧度制)
         */
        setRotation(rotation);

        /**
         * 设置图元在3D拓扑中的三维旋转角度
         * @param {Number} x 沿x轴的旋转角度(弧度制)
         * @param {Number} y 沿y轴的旋转角度(弧度制)
         * @param {Number} z 沿z轴的旋转角度(弧度制)
         */
        setRotation3d(x, y, z);

        /**
         * 设置三维旋转模式<br>
         * 图元在3D拓扑中旋转时，先沿x轴旋转，再沿y轴旋转和先沿y轴旋转，再沿x轴旋转最后的结果是不一样的
         * @param {String} rotationMode 旋转模式，可选值如下：
         * <ul>
         * <li>xyz:先进行x轴旋转，再进行y轴旋转，最后进行z轴旋转</li>
         * <li>xzy:先进行x轴旋转，再进行z轴旋转，最后进行y轴旋转</li>
         * <li>yxz:先进行y轴旋转，再进行x轴旋转，最后进行z轴旋转</li>
         * <li>yzx:先进行y轴旋转，再进行z轴旋转，最后进行x轴旋转</li>
         * <li>zxy:先进行z轴旋转，再进行x轴旋转，最后进行y轴旋转</li>
         * <li>zyx:先进行z轴旋转，再进行y轴旋转，最后进行x轴旋转</li>
         * </ul>
         * @see {@link ht.Node#getRotationMode getRotationMode}
         */
        setRotationMode(rotationMode);

        /**
         * 设置图元在3D拓扑中沿x轴的旋转角度(弧度制)
         * @param {Number} rotationX 旋转角度(弧度制)
         */
        setRotationX(rotationX);

        /**
         * 设置图元在3D拓扑中沿y轴的旋转角度(弧度制)
         * @param {Number} rotationY 旋转角度(弧度制)
         */
        setRotationY(rotationY);

        /**
         * 设置图元在3D拓扑中沿z轴的旋转角度(弧度制)
         * @param {Number} rotationZ 旋转角度(弧度制)
         */
        setRotationZ(rotationZ);

        /**
         * 设置图元在2D拓扑中的尺寸(宽高)
         * @param {Number} width 宽度
         * @param {Number} height 高度
         */
        setSize(width: number, height: number);

        /**
         * 设置图元在3D拓扑中的尺寸
         * @param {Number} width x轴方向的长度
         * @param {Number} tall y轴方向的长度
         * @param {Number} height z轴方向的长度
         */
        setSize3d(width: number, tall: number, height: number);

        /**
         * 设置图元在3D拓扑中的y轴方向的长度
         * @return {Number} tall y轴方向的长度
         */
        setTall(tall: number);

        /**
         * 设置图元在3D拓扑中的x轴方向的长度
         * @return {Number} width x轴方向的长度
         */
        setWidth(width: number);

        /**
         * 在当前坐标的基础上增加x、y、z三个方向的平移值，{@link ht.Node#translate3d translate3d}的缩写
         * @param {Number} tx x轴方向的平移值
         * @param {Number} ty y轴方向的平移值
         * @param {Number} tz z轴方向的平移值
         * @see {@link ht.Node#translate3d translate3d}
         */
        t3(tx, ty, tz);

        /**
         * 在当前坐标的基础上增加x、y两个方向的平移值
         * @param {Number} tx x轴方向的平移值
         * @param {Number} ty y轴方向的平移值
         */
        translate(tx: number, ty: number);

        /**
         * 在当前坐标的基础上增加x、y、z三个方向的平移值，{@link ht.Node#t3 t3}的缩写
         * @param {Number} tx x轴方向的平移值
         * @param {Number} ty y轴方向的平移值
         * @param {Number} tz z轴方向的平移值
         * @see {@link ht.Node#t3 t3}
         */
        translate3d(tx: number, ty: number, tz: number);

        /**
         * 沿向量平移
         * @param {Array} direction 方向向量
         * @param {Number} distance 平移距离
         */
        translate3dBy(direction: any, distance: number);

        /**
         * 沿向量[0, 0, -1]平移
         * @param {Number} distance 平移距离
         */
        translateBack(distance: number);

        /**
         * 沿向量[0, -1, 0]平移
         * @param {Number} distance 平移距离
         */
        translateBottom(distance: number);

        /**
         * 沿向量[0, 0, 1]平移
         * @param {Number} distance 平移距离
         */
        translateFront(distance: number);

        /**
         * 沿向量[-1, 0, 0]平移
         * @param {Number} distance 平移距离
         */
        translateLeft(distance: number);

        /**
         * 沿向量[1, 0, 0]平移
         * @param {Number} distance 平移距离
         */
        translateRight(distance: number);

        /**
         * 沿向量[0, 1, 0]平移
         * @param {Number} distance 平移距离
         */
        translateTop(distance: number);
    }
    export class CSGShape extends ht.Shape {

    }
    export class CSGNode extends ht.Node {

    }
    export class CSGBox extends ht.CSGNode {

    }

    export class DoorWindow extends ht.CSGNode {

    }

    export class Edge extends Data {
        constructor(source?, target?: any);

        toggle();
        /**
         * 获取连线组，起始和目标节点间有多条连线时才有值
         * @return {ht.EdgeGroup} 连线分组
         */
        getEdgeGroup();

        /**
         * 获取当前连线在连线组内的索引
         * @return {Number} 索引
         */
        getEdgeGroupIndex();

        /**
         * 获取当前连线在连线组内的索引
         * @return {Number} 索引
         */
        getEdgeGroupIndex();

        /**
         * 获取当前连线所在的连线组中的连线数
         * @return {Number} 连线数
         */
        getEdgeGroupSize();

        /**
         * 获取起始图元
         * @return {ht.Node} 起始图元
         */
        getSource(): ht.Node;

        /**
         * 获取拓扑上连接的起始图元(代理)
         * @return {ht.Node} 起始图元(代理)
         */
        getSourceAgent(): ht.Node;

        /**
         * 获取目标图元
         * @return {ht.Node} 目标图元
         */
        getTarget(): ht.Node;

        /**
         * 获取拓扑上连接的目标图元(代理)
         * @return {ht.Node} 目标图元(代理)
         */
        getTargetAgent();

        /**
         * 获取当前连线是否为所在连线组的代理
         * @return {Boolean}
         */
        isEdgeGroupAgent();

        /**
         * 判断当前连线在连线组中是否被隐藏
         * @return {Boolean}
         */
        isEdgeGroupHidden();

        /**
         * 是否是自环(起始和目标是同一个图元)
         * @return {Boolean}
         */
        isLooped(): boolean;

        /**
         * 设置起始图元
         * @param {ht.Node} source 起始图元
         */
        setSource(source: ht.Node);

        /**
         * 设置目标图元
         * @param {ht.Node} target 目标图元
         */
        setTarget(target: ht.Node);

    }

    /**
     * 连线分组
     * @constructor
     */
    export class EdgeGroup {
        /**
         * 提供一个回调函数遍历此分组的所有连线
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example edgeGroup.each(function(edge) {
     *   console.log(edge);
     * });
         */
        each(func, scope);

        /**
         * 提供一个回调函数遍历相同起始和目标图元之间其它分组中的连线
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example edgeGroup.eachSiblingEdge(function(edge) {
     *   console.log(edge);
     * });
         */
        eachSiblingEdge(func, scope);

        /**
         * 根据索引获取分组中的连线
         * @param {Number} index 索引
         * @return {ht.Edge}
         */
        get(index);

        /**
         * 获取分组中所有连线
         * @return {ht.List}
         */
        getEdges();

        /**
         * 获取相同起始和目标图元之间的其它分组
         * @return {ht.List}
         */
        getSiblings();

        /**
         * 获取参数连线在分组中的索引
         * @param {ht.Edge} edge 连线
         * @return {Number}
         */
        indexOf(edge);

        /**
         * 获取分组中的连线数量
         * @return {Number}
         */
        size();

    }
    /**
     * 选择模型管理DataModel模型中Data对象的选择状态，
     * 每个DataModel对象都内置一个SelectionModel选择模型，
     * 控制这个SelectionModel即可控制所有绑定该DataModel的视图组件的对象选择状态，
     * 这意味着共享同一DataModel的组件默认就具有选中联动功能。<br>
     * 如果希望某些组件不与其他组件选中联动，
     * 可通过调用view.setSelectionModelShared(false)，
     * 这样该view将创建一个专属的SelectionModel实例。
     * @constructor
     */
    export class SelectionModel {
        /**
         * 增加自身属性变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @see {@link ht.SelectionModel#mp mp}
         */
        addPropertyChangeListener(listener, scope, ahead);

        /**
         * 增加自身属性变化事件监听器，{@link ht.SelectionModel#addPropertyChangeListener addPropertyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @see {@link ht.SelectionModel#addPropertyChangeListener addPropertyChangeListener}
         */
        mp(listener, scope, ahead);

        /**
         * 删除自身属性变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.SelectionModel#ump ump}
         */
        removePropertyChangeListener(listener, scope);

        /**
         * 删除自身属性变化事件监听器，{@link ht.SelectionModel#removePropertyChangeListener removePropertyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.SelectionModel#removePropertyChangeListener removePropertyChangeListener}
         */
        ump(listener, scope);


        /**
         * 增加监听器，监听选中变化事件
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @see {@link ht.SelectionModel#ms ms}
         * @example dataModel.addSelectionChangeListener(function(event) {
     *      //event格式：
     *      {
     *      	kind: "set",//事件类型set|remove|append|clear
     *      	datas: datas,//包含所有选中状态变化的数据元素，之前选中现在取消选中，和之前没选中现在被选中的数据元素
     *      }
     * });
         */
        addSelectionChangeListener(listener, scope?, ahead?);

        /**
         * 增加监听器，监听选中变化事件，{@link ht.SelectionModel#addSelectionChangeListener addSelectionChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @see {@link ht.SelectionModel#addSelectionChangeListener addSelectionChangeListener}
         * @example dataModel.ms(function(event) {
     *      //event格式：
     *      {
     *      	kind: "set",//事件类型set|remove|append|clear
     *      	datas: datas,//包含所有选中状态变化的数据元素，之前选中现在取消选中，和之前没选中现在被选中的数据元素
     *      }
     * });
         */
        ms(listener, scope, ahead);

        /**
         * 删除监听选中变化事件的监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.SelectionModel#ums ums}
         */
        removeSelectionChangeListener(listener, scope);

        /**
         * 删除监听选中变化事件的监听器，{@link ht.SelectionModel#removeSelectionChangeListener removeSelectionChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.SelectionModel#removeSelectionChangeListener removeSelectionChangeListener}
         */
        ums(listener, scope);

        /**
         * 追加选中一个或多个数据元素，参数可为单个数据元素，也可为ht.List或Array数组
         * @param {ht.Data|ht.List|Array} datas 数据元素
         * @see {@link ht.SelectionModel#as as}
         */
        appendSelection(datas);

        /**
         * 追加选中一个或多个数据元素，参数可为单个数据元素，也可为ht.List或Array数组，{@link ht.SelectionModel#appendSelection appendSelection}的缩写
         * @param {ht.Data|ht.List|Array} datas 数据元素
         * @see {@link ht.SelectionModel#appendSelection appendSelection}
         */
        as(datas);

        /**
         * 取消所有选中数据元素
         * @see {@link ht.SelectionModel#cs cs}
         */
        clearSelection();

        /**
         * 取消所有选中数据元素，{@link ht.SelectionModel#clearSelection clearSelection}的缩写
         * @see {@link ht.SelectionModel#clearSelection clearSelection}
         */
        cs();

        /**
         * 判断data对象是否被选中
         * @param {ht.Data} data 要判断的data对象
         * @see {@link ht.SelectionModel#co co}
         */
        contains(data);

        /**
         * 判断data对象是否被选中，{@link ht.SelectionModel#contains contains}的缩写
         * @param {ht.Data} data 要判断的data对象
         * @see {@link ht.SelectionModel#contains contains}
         */
        co(data);

        /**
         * 获取{@link ht.DataModel DataModel}，{@link ht.SelectionModel#getDataModel getDataModel}的缩写
         * @return {ht.DataModel} dataModel
         * @see {@link ht.SelectionModel#getDataModel getDataModel}
         */
        dm();

        /**
         * 获取{@link ht.DataModel DataModel}
         * @return {ht.DataModel} dataModel
         * @see {@link ht.SelectionModel#dm dm}
         */
        getDataModel();

        /**
         * 提供一个回调函数遍历此选中模型
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example selectionModel.each(function(data) {
     *   console.log(data);
     * });
         */
        each(func, scope);

        /**
         * 返回首个被选中的数据元素，如果没有选中数据元素则返回空
         * @return {ht.Data} 首个被选中的数据元素
         * @see {@link ht.SelectionModel#fd fd}
         */
        getFirstData();

        /**
         * 返回首个被选中的数据元素，如果没有选中数据元素则返回空，此方法是{@link ht.SelectionModel#getFirstData getFirstData}的缩写
         * @return {ht.Data} 首个被选中的数据元素
         * @see {@link ht.SelectionModel#getFirstData getFirstData}
         */
        fd();

        /**
         * 返回最后被选中的数据元素，如果没有选中数据元素则返回空
         * @return {ht.Data} 最后被选中的数据元素
         * @see {@link ht.SelectionModel#ld ld}
         */
        getLastData(): ht.Data;

        /**
         * 返回最后被选中的数据元素，如果没有选中数据元素则返回空，{@link ht.SelectionModel#getLastData getLastData}的缩写
         * @return {ht.Data} 最后被选中的数据元素
         * @see {@link ht.SelectionModel#getLastData getLastData}
         */
        ld();

        /**
         * 返回选中过滤器函数<br>
         * 有些数据元素不希望被用户选中，可以通过设置此过滤器实现
         * @return {Function} 选中过滤器函数
         * @see {@link ht.SelectionModel#setFilterFunc setFilterFunc}
         */
        getFilterFunc();

        /**
         * 设置选中过滤器函数<br>
         * 有些数据元素不希望被用户选中，可以通过设置此过滤器实现
         * @param {Function} func 选中过滤器函数
         * @example //禁止选中name为test的数据元素
         * selectionModel.setFilterFunc(function(data) {
     *  if (data.getName() === 'test') {
     *  	return false;
     *  } else {
     *  	return true;
     *  }
     * });
         */
        setFilterFunc(func);

        /**
         * 获取所有被选中数据元素集合，注意不可直接对返回的集合进行增删操作，
         * 如果需要增删操作，应使用toSelection方法
         * @return {ht.List} 被选中的数据元素集合
         * @see {@link ht.SelectionModel#toSelection toSelection}
         */
        getSelection();

        /**
         * 获取所有被选中数据元素集合，注意不可直接对返回的集合进行增删操作，
         * 如果需要增删操作，应使用toSelection方法
         * @return {ht.List} 被选中的数据元素集合
         * @see {@link ht.SelectionModel#toSelection toSelection}
         */
        toSelection(matchFunc, scope);

        /**
         * 以matchFunc为过滤函数构建新的元素集合并返回
         * @param {Function} [matchFunc] 过滤函数
         * @param {Object} [scope] 函数域
         * @return {ht.List} 元素集合
         */
        setSelection(datas);

        /**
         * 设置选中数据元素，参数可为单个数据元素，也可为ht.List或Array数组，{@link ht.SelectionModel#setSelection setSelection}的缩写
         * @param {ht.Data|ht.List|Array} datas 数据元素
         */
        ss(datas: ht.Data | ht.List | Array<any>);

        /**
         * 获取选中模式
         * @default multiple
         * @return {String} none|single|multiple
         */
        getSelectionMode();

        /**
         * 设置选中模式，可选值：
         * <ul>
         * <li>none:不可选中</li>
         * <li>single:只能选中一个数据元素</li>
         * <li>multiple:可以选中多个数据元素</li>
         * </ul>
         * @default multiple
         * @param {String} mode 选中模式
         */
        setSelectionMode(mode);

        /**
         * 判断是否有选中的数据元素
         * @return {Boolean}
         */
        isEmpty();

        /**
         *
         * 判断数据元素是否可被选中
         * @param {ht.Data} data 要判断的数据元素
         * @return {Boolean}
         */
        isSelectable(data);

        /**
         * 取消选中数据元素，参数可为单个数据元素，也可为ht.List或Array数组
         * @param {ht.Data|ht.List|Array} datas 数据元素
         * @see {@link ht.SelectionModel#rs rs}
         */
        removeSelection(datas);

        /**
         * 取消选中数据元素，参数可为单个数据元素，也可为ht.List或Array数组，{@link ht.SelectionModel#removeSelection removeSelection}的缩写
         * @param {ht.Data|ht.List|Array} datas 数据元素
         * @see {@link ht.SelectionModel#removeSelection removeSelection}
         */
        rs(datas);

        /**
         * 选中DataModel中的所有数据元素
         * @see {@link ht.SelectionModel#sa sa}
         */
        selectAll();

        /**
         * 选中DataModel中的所有数据元素，{@link ht.SelectionModel#selectAll selectAll}的缩写
         * @see {@link ht.SelectionModel#selectAll selectAll}
         */
        sa();

        /**
         * 获取选中模型中数据元素的个数
         * @return {Number}
         */
        size();

    }
    export class DataModel {

        /**
         * 获取或设置attr属性，仅有一个参数时相当于{@link ht.DataModel#getAttr getAttr}，有两个参数时相当于{@link ht.DataModel#setAttr setAttr}
         * @param {String} name 属性名
         * @param {Object} [value] 属性值
         * @returns {Object}
         */
        a(name, value);

        /**
         * 增加数据元素
         * @param {ht.Data} data 数据元素
         * @param {Number} [index] 插入索引
         */
        add(data, index?: number);

        /**
         * 增加数据模型增删变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.addDataModelChangeListener(function(event) {
     *      //event格式：
     *      {
     *      	kind: "add"|"remove"|"clear",//事件类型
     *      	data: data//事件相关data
     *      }
     * });
         * @see {@link ht.DataModel#mm mm}
         */
        addDataModelChangeListener(listener, scope, ahead);

        /**
         * 增加数据模型增删变化事件监听器，{@link ht.DataModel#addDataModelChangeListener addDataModelChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.mm(function(event) {
     *      //event格式：
     *      {
     *      	kind: "add"|"remove"|"clear",//事件类型
     *      	data: data//事件相关data
     *      }
     * });
         * @see {@link ht.DataModel#addDataModelChangeListener addDataModelChangeListener}
         */
        mm(listener, scope, ahead);

        /**
         * 增加模型中Data元素属性变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.addDataPropertyChangeListener(function(event) {
     *      //event格式：
     *      {
     *      	property: "name",//发生变化的属性
     *      	data: data,//属性发生变化的data
     *      	oldValue: 0,//旧值
     *      	newValue: 1//新值
     *      }
     * });
         * @see {@link ht.DataModel#md md}
         */
        addDataPropertyChangeListener(listener, scope, ahead);

        /**
         * 增加模型中Data元素属性变化事件监听器，{@link ht.DataModel#addDataPropertyChangeListener addDataPropertyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.md(function(event) {
     *      //event格式：
     *      {
     *      	property: "name",//发生变化的属性
     *      	data: data,//属性发生变化的data
     *      	oldValue: 0,//旧值
     *      	newValue: 1//新值
     *      }
     * });
         * @see {@link ht.DataModel#addDataPropertyChangeListener addDataPropertyChangeListener}
         */
        md(listener, scope, ahead);


        /**
         * 增加监听器，监听Data在DataModel中的层次(用于TreeView、TreeTableView等)变化事件
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.addHierarchyChangeListener(function(event) {
     *      //event格式：
     *      {
     *      	data: data,//事件相关Data
     *      	oldIndex: 0,//旧层次
     *      	newIndex: 1//新层次
     *      }
     * });
         * @see {@link ht.DataModel#mh mh}
         */
        addHierarchyChangeListener(listener, scope, ahead);

        /**
         * 增加监听器，监听Data在DataModel中的层次(用于TreeView、TreeTableView等)变化事件，{@link ht.DataModel#addHierarchyChangeListener addHierarchyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.mh(function(event) {
     *      //event格式：
     *      {
     *      	data: data,//事件相关Data
     *      	oldIndex: 0,//旧层次
     *      	newIndex: 1//新层次
     *      }
     * });
         * @see {@link ht.DataModel#addHierarchyChangeListener addHierarchyChangeListener}
         */
        mh(listener, scope, ahead);

        /**
         * 增加监听器，监听Data在DataModel中的索引(用于拓扑组件)变化事件
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
         * @example dataModel.addIndexChangeListener(function(event) {
     *      //event格式：
     *      {
     *      	data: data,//事件相关Data
     *      	oldIndex: 0,//旧索引
     *      	newIndex: 1//新索引
     *      }
     * });
         */
        addIndexChangeListener(listener, scope, ahead);

        /**
         * 删除容器中所有Data对象，该操作一次性清空，没有逐个remove的过程，不会影响Data父子关系
         */
        clear();

        /**
         * 判断容器是否包含该data对象
         * @param {ht.Data} data 要判断的数据元素
         * @return {Boolean} 容器是否包含参数data
         */
        contains(data);

        /**
         * 反序列化数据到数据容器
         * @param {String} json 要被反序列化的json字符串
         * @param {ht.Data} rootParent 指定反序列化的数据元素的父元素
         * @param {Boolean} setId 反序列化后的数据元素是否保留原id
         * @return {ht.List} 被反序列化的数据元素集合
         */
        deserialize(json, rootParent, setId);

        /**
         * 提供一个回调函数遍历此容器
         * @param {Function} func 遍历函数
         * @param {Object} [scope] 函数域
         * @example dataModel.each(function(data) {
     *   console.log(data);
     * });
         */
        each(func, scope);

        /**
         * 以data为起始深度优先遍历Data对象
         * @param {Function} func 遍历函数
         * @param {ht.Data} [data] 遍历起点元素
         * @param {Object} [scope] 函数域
         */
        eachByDepthFirst(func, data, scope);

        /**
         * 以data为起始广度优先遍历Data对象
         * @param {Function} func 遍历函数
         * @param {ht.Data} [data] 遍历起点元素
         * @param {Object} [scope] 函数域
         */
        eachByBreadthFirst(func, data, scope);

        /**
         * 获取attr属性
         * @param {String} name 属性名
         * @returns {Object}
         */
        getAttr(name);

        /**
         * 设置attr属性
         * @param {String} name 属性名
         * @param {Object} value 属性值
         */
        setAttr(name, value);

        /**
         * 获取attr属性对象，该属性默认为空，用于存储用户业务信息
         * @return {Object} attr属性对象
         */
        getAttrObject();

        /**
         * 设置attr属性对象，该属性默认为空，用于存储用户业务信息
         * @param {Object} attrObject attr属性对象
         */
        setAttrObject(attrObject);

        /**
         * 根据id快速查找Data对象，模型内部维护着一个id->data的映射表，因此查找速度比遍历方式快
         * @param {String|Number} id 要查找的id
         * @return {ht.Data} 查找到的Data
         */
        getDataById(id): ht.Data;

        /**
         * 根据tag快速查找，模型内部维护着一个tag->data的映射表，因此查找速度比遍历方式快
         * @param {String|Number} tag 要查找的tag
         * @return {ht.Data} 查找到的Data
         */
        getDataByTag(tag);

        /**
         * 获取所有添加到容器的Data数据集合
         * @return {ht.List}
         */
        getDatas();

        /**
         * 获取历史管理器
         * @return {ht.HistoryManager}
         */
        getHistoryManager();

        /**
         * 获取所有parent为空的Data对象
         * @return {ht.List}
         */
        getRoots();

        /**
         * 此函数返回一个map，决定序列化时哪些attr属性可被序列化，默认所有attr对象里的属性都会被序列化
         * @example function(){
     *     var name, map = ;
     *     for (name in this._attrObject) {
     *         map[name] = 1;
     *     }
     *     return map;
     * }
         * @return {Object} 需要被序列化的attr属性map
         */
        getSerializableAttrs();

        /**
         * 获取和data同父子层次的兄弟数组，如果data父亲为空，则返回dataModel.getRoots()
         * @param {ht.Data} data 目标data
         * @return {ht.List}
         */
        getSiblings(data);

        /**
         * 是否自动调整data在容器中索引顺序
         * @return {Boolean}
         */
        isAutoAdjustIndex();

        /**
         * 判断容器是否为空
         * @return {Boolean}
         */
        isEmpty();

        /**
         * 移动data到同层兄弟数组中的下一个位置
         * @param {ht.Data} data 要移动的数据元素
         */
        moveDown(data);

        /**
         * 移动当前选中的数据元素到同层兄弟数组中的下一个位置
         * @param {ht.SelectionModel} [sm] 要操作的选中模型，如果为空，使用dataModel自身绑定的选中模型
         */
        moveSelectionDown(sm);

        /**
         * 移动当前选中的数据元素到同层兄弟数组的底部
         * @param {ht.SelectionModel} [sm] 要操作的选中模型，如果为空，使用dataModel自身绑定的选中模型
         */
        moveSelectionToBottom(sm);

        /**
         * 获取该容器的选择模型
         * @see {@link ht.DataModel#sm sm}
         * @return {ht.SelectionModel}
         */
        getSelectionModel(): ht.SelectionModel;

        /**
         * 移动当前选中的数据元素到同层兄弟数组的顶部
         * @param {ht.SelectionModel} [sm] 要操作的选中模型，如果为空，使用dataModel自身绑定的选中模型
         */
        moveSelectionToTop(sm);

        /**
         * 移动当前选中的数据元素到同层兄弟数组中的上一个位置
         * @param {ht.SelectionModel} [sm] 要操作的选中模型，如果为空，使用dataModel自身绑定的选中模型
         */
        moveSelectionUp(sm);

        /**
         * 移动数据元素到同层兄弟数组中的指定索引
         * @param {ht.Data} data 要移动的数据元素
         * @param {Number} newIndex 目标索引
         */
        moveTo(data, newIndex);

        /**
         * 移动数据元素到同层兄弟数组的底部
         * @param {ht.Data} data 要移动的数据元素
         */
        moveToBottom(data);

        /**
         * 移动数据元素到同层兄弟数组的顶部
         * @param {ht.Data} data 要移动的数据元素
         */
        moveToTop(data);

        /**
         * 移动数据元素到同层兄弟数组中的上一个位置
         * @param {ht.Data} data 要移动的数据元素
         */
        moveUp(data);

        /**
         * 数据元素添加的回调函数，可重载做后续处理
         * @param {ht.Data} data 新添加的数据元素
         */
        onAdded(data);

        /**
         * 数据元素属性变化回调函数，可重载做后续处理
         * @param {ht.Data} data 发生变化的数据元素
         * @param {Object} e 事件信息
         */
        onDataPropertyChanged(data, e);

        /**
         * 数据元素删除时回调函数，可重载做后续处理
         * @param {ht.Data} data 被删除的数据元素
         */
        onRemoved(data);

        /**
         * 删除数据元素，该操作有以下副作用：
         * <ul>
         * <li>其子孙被递归从DataModel中删除</li>
         * <li>被断开父子关系data.setParent(null)</li>
         * <li>Edge类型通过edge.setSource(null)和data.setTarget(null)断开节点关系</li>
         * <li>Node类型会将其关联的连线从DataModel中删除</li>
         * <li>Node类型通过data.setHost(null)断开与宿主吸附节点关系</li>
         * </ul>
         * @param {ht.Data} data 要删除的数据元素
         */
        remove(data);

        /**
         * 通过id删除数据元素
         * @param {Number} id 要删除的数据元素id
         * @see {@link ht.DataModel#remove remove}
         */
        removeDataById(id);

        /**
         * 通过tag删除数据元素
         * @param {String} tag 要删除的数据元素tag
         * @see {@link ht.DataModel#remove remove}
         */
        removeDataByTag(tag);

        /**
         * 删除数据模型增删变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#umm umm}
         */
        removeDataModelChangeListener(listener, scope);

        /**
         * 删除数据模型增删变化事件监听器，{@link ht.DataModel#removeDataModelChangeListener removeDataModelChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#removeDataModelChangeListener removeDataModelChangeListener}
         */
        umm(listener, scope);

        /**
         * 删除模型中Data元素属性变化事件监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#umd umd}
         */
        removeDataPropertyChangeListener(listener, scope);

        /**
         * 删除模型中Data元素属性变化事件监听器，{@link ht.DataModel#removeDataPropertyChangeListener removeDataPropertyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#removeDataPropertyChangeListener removeDataPropertyChangeListener}
         */
        umd(listener, scope);

        /**
         * 删除监听Data在DataModel中的层次(用于TreeView、TreeTableView等)变化事件的监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#umh umh}
         */
        removeHierarchyChangeListener(listener, scope);

        /**
         * 删除监听Data在DataModel中的层次(用于TreeView、TreeTableView等)变化事件的监听器，{@link ht.DataModel#removeHierarchyChangeListener removeHierarchyChangeListener}的缩写
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         * @see {@link ht.DataModel#removeHierarchyChangeListener removeHierarchyChangeListener}
         */
        umh(listener, scope);

        /**
         * 删除监听Data在DataModel中的索引(用于拓扑组件)变化事件的监听器
         * @param {Function} listener 监听器函数
         * @param {Object} [scope] 监听器函数域
         */
        removeIndexChangeListener(listener, scope);

        /**
         * 将data在拓扑上置底
         * @param {ht.Data} data 要置底的数据元素
         */
        sendToBottom(data);

        /**
         * 将data在拓扑上置顶
         * @param {ht.Data} data 要置顶的数据元素
         */
        sendToTop(data);

        /**
         * 将数据模型序列化成JSON格式字符串
         * @param {Number} space 缩进空格数
         */
        serialize(space);

        /**
         * 设置是否自动调整data在容器中索引顺序
         * @param {Boolean} autoAdjustIndex 是否自动调整data在容器中索引顺序
         */
        setAutoAdjustIndex(autoAdjustIndex);

        /**
         * 返回当前容器中Data对象的总数
         * @return {Number}
         */
        size();

        /**
         * 获取该容器的选择模型
         * @see {@link ht.DataModel#getSelectionModel getSelectionModel}
         * @return {ht.SelectionModel}
         */
        sm();

        /**
         * 以matchFunc为过滤函数构建新的元素集合并返回
         * @param {Function} [matchFunc] 过滤函数
         * @param {Object} [scope] 函数域
         * @return {ht.List} 元素集合
         */
        toDatas(matchFunc, scope);

        /**
         * 将数据模型序列化成JSON格式对象
         * @return {Object} JSON对象
         */
        toJSON(): any;
    }


    /**
     * 组图元类型，可以包含Node和其它孩子元素，可双击展开或关闭
     * @constructor
     * @extends ht.Node
     */
    export class Group {
        /**
         * 判断Group对象是否处于展开状态
         * @return {Boolean}
         */
        isExpanded(): boolean;

        /**
         * 设置Group对象的展开关闭状态
         * @param {Boolean} expanded 为true展开，false关闭
         */
        setExpanded(expanded: boolean);

        /**
         * 切换展开关闭状态
         */
        toggle();
    }


    /**
     * 多边形元素，由多点组合形成的多边形，如果不填充背景色，可作为折线或曲线
     * @constructor
     * @extends ht.Node
     */
    export class Shape extends Node {
        /**
         * 增加点
         * @param {Object} point 坐标点
         * @param {Number} [index] 索引，如果不指定索引则加到最后
         */
        addPoint(point, index?: number);

        /**
         * 计算Shape的长度
         * @param {Number} [resolution] 曲线分段微分数，默认为12，数字越大计算结果越精确，同时也越耗费性能
         * @return {Number}
         */
        getLength(resolution);

        /**
         * 获取点集合
         * @return {ht.List}
         */
        getPoints(): ht.List;

        /**
         * 获取线段类型集合
         * @return {ht.List}
         */
        getSegments();

        /**
         * 获取3D拓扑中的线段厚度，小于0时可实现类似地板的填充效果
         * @return {Number}
         */
        getThickness();

        /**
         * 是否闭合Shape
         * @return {Boolean}
         */
        isClosePath();

        /**
         * 根据索引删除点
         * @param {Number} index 索引
         */
        removePointAt(index);

        /**
         * 设置是否闭合Shape
         * @param {Boolean} v
         */
        setClosePath(v);

        /**
         * 修改索引指向的点坐标
         * @param {Number} index 索引
         * @param {Object} point 新坐标点
         */
        setPoint(index, point);

        /**
         * 设置Shape的点
         * @param {ht.List} points
         */
        setPoints(points);

        /**
         * 设置Shape的线段类型
         * @param {ht.List} segments
         */
        setSegments(segments);

        /**
         * 设置3D拓扑中的线段厚度，小于0时可实现类似地板的填充效果
         * @param {Number} thickness
         */
        setThickness(thickness);

        /**
         * 构建一个新的Shape点集合并返回
         * @return {ht.List}
         */
        toPoints();

        /**
         * 构建一个新的线段类型集合并返回
         * @return {ht.List}
         */
        toSegments();
    }
    export class Polyline extends ht.Shape {

    }
    namespace graph {

        /**
         * 拓扑图形组件ht.graph.GraphView是HT框架中2D功能最丰富的组件，其相关类库都在ht.graph包下。<br>
         * GraphView具有基本图形的呈现和编辑、拓扑节点连线及自动布局功能；
         * 封装了电力和电信等行业预定义对象，具有动画渲染等特效， 因此其应用面很广泛，可作为监控领域的绘图工具和人机界面，或作为一般性的图形化编辑工具，或扩展成工作流和组织图等企业应用。
         * @param {ht.DataModel} dataModel 绑定的数据模型
         * @constructor
         */
        export class GraphView {
            constructor(dataModel?: ht.DataModel);

            /**
             * 增加底层Painter<br>
             * 拓扑组件上提供Painter接口，开发者可以使用Canvas的画笔对象自由绘制任意形状，底层Painter绘制在拓扑最下面
             * @param {Function} painter Painter类
             * @example //Painter示例：
             * function MyBottomPainter() {
       * }
             * ht.Default.def(MyBottomPainter, Object, {
       * 	draw: function(g) {
       * 		g.save();
       * 		//draw...
       * 		g.restore();
       * 	}
       * });
             * graphView.addBottomPainter(MyBottomPainter);
             */
            addBottomPainter(painter);

            /**
             * 增加交互事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph.GraphView#mi mi}
             * @example //示例：
             * graphView.addInteractorListener(function(event) {
       * 		//event格式：
       * 		{
       * 			//clickData, doubleClickData, clickBackground, doubleClickBackground,
       * 			//beginRectSelect, betweenRectSelect, endRectSelect, beginMove, betweenMove, endMove,
       * 			//beginPan, betweenPan, endPan, beginEditRect, betweenEditRect, endEditRect, beginEditPoint, betweenEditPoint, endEditPoint
       * 			//beginEditRotation, betweenEditRotation, endEditRotation, moveLeft, moveRight, moveUp, moveDown, toggleNote, toggleNote2
       * 			kind: 'clickData',//事件类型
       * 			data: data,//事件相关的数据元素
       * 			part: "part",//事件的区域,icon、label等
       * 			event: e//html原生事件
       * 		}
       * });
             */
            addInteractorListener(listener, scope, ahead);

            /**
             * 增加自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph.GraphView#mp mp}
             */
            addPropertyChangeListener(listener, scope, ahead);

            /**
             * 增加顶层Painter<br>
             * 拓扑组件上提供Painter接口，开发者可以使用Canvas的画笔对象自由绘制任意形状，顶层Painter绘制在拓扑最上面
             * @param {Function} painter Painter类
             * @example //Painter示例：
             * function MyTopPainter() {
       * }
             * ht.Default.def(MyTopPainter, Object, {
       * 	draw: function(g) {
       * 		g.save();
       * 		//draw...
       * 		g.restore();
       * 	}
       * });
             * graphView.addTopPainter(MyTopPainter);
             */
            addTopPainter(painter);

            /**
             * 监听视图事件，如布局、刷新等
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             */
            addViewListener(listener, scope, ahead);

            /**
             * 传入即将设置的水平平移值，返回最终设置值，可重载限制水平平移范围
             * @param {Number} value 原始水平平移值
             * @return {Number} 新的水平平移值
             */
            adjustTranslateX(value);

            /**
             * 传入即将设置的垂直平移值，返回最终设置值，可重载限制垂直平移范围
             * @param {Number} value 原始垂直平移值
             * @return {Number} 新的垂直平移值
             */
            adjustTranslateY(value);

            /**
             * 传入即将修改的缩放值，返回最终运行设置的缩放值，可重载进行自定义
             * @param {Number} value 原始缩放值
             * @return {Number} 最终缩放值
             */
            adjustZoom(value);

            /**
             * 关闭ToolTip功能
             */
            disableToolTip();

            /**
             * 获取或设置数据模型，没有参数时相当于{@link ht.graph.GraphView#getDataModel getDataModel}，有参数时相当于{@link ht.graph.GraphView#setDataModel setDataModel}
             * @param {ht.DataModel} [dataModel] 数据模型
             * @return {ht.DataModel} dataModel
             */
            dm(dataModel);

            /**
             * 提供一个回调函数遍历此拓扑中的图元，与DataModel上的each方法不同，此方法还考虑了拓扑中的Layer，从低Layer向高Layer遍历
             * @param {Function} func 遍历函数
             * @param {Object} [scope] 函数域
             * @example graphView.each(function(data) {
       *   console.log(data);
       * });
             */
            each(func, scope);

            /**
             * 启用ToolTip
             */
            enableToolTip();

            /**
             * 缩放平移整个拓扑以展示所有的图元
             * @param {Boolean} [anim] 是否使用动画
             * @param {Number} [padding] 缩放后图元区域与拓扑边缘的距离，默认为20
             * @param {Boolean} [notZoomIn] 是否将最小缩放值限定为1
             */
            fitContent(anim?: boolean, padding?: number, notZoomIn?: boolean);

            /**
             * 缩放平移整个拓扑以展示参数Data
             * @param {ht.Data} data 要显示的data
             * @param {Boolean} [anim] 是否使用动画
             * @param {Number} [padding] 缩放后图元区域与拓扑边缘的距离，默认为20
             * @param {Boolean} [notZoomIn] 是否将最小缩放值限定为1
             * @param {Boolean} [retry] 当拓扑状态异常时，是否延时重试fitData，默认为true
             */
            fitData(data, anim, padding, notZoomIn, retry);

            /**
             * 缩放平移整个拓扑以展示矩形范围内的图元
             * @param {Object} rect 矩形范围
             * @param {Boolean} [anim] 是否使用动画
             * @param {Boolean} [notZoomIn] 是否将最小缩放值限定为1
             */
            fitRect(rect, anim, notZoomIn);

            /**
             * 获取自动滚动区域，当鼠标距离拓扑边缘小于这个值时，拓扑自动滚动(调整translateX或translateY)
             * @return {Number} 自动滚动区域
             */
            getAutoScrollZone();

            /**
             * 获取图元body的染色，可重载此方法返回自定义的颜色
             * @param {ht.Data} data 要染色的图元
             * @return {color} 最终颜色，默认为data.s('body.color')
             */
            getBodyColor(data);

            /**
             * 获取图元边框颜色，可重载此方法返回自定义的颜色
             * @param {ht.Data} data 要染色的图元
             * @return {color} 最终颜色，默认为data.s('border.color')
             */
            getBorderColor(data);

            /**
             * 获取Group内child的尺寸范围，这个尺寸参与计算Group的大小
             * @param {ht.Data} child 子节点
             * @return {Object} 子节点的尺寸范围
             */
            getBoundsForGroup(child);

            /**
             * 获取拓扑的画布
             * @return {HTMLCanvasElement} 画布
             */
            getCanvas();

            /**
             * 获取拓扑中所有图元占用的矩形区域
             * @return {Object} 内容区域
             */
            getContentRect();

            /**
             * 获取当前子网
             * @return {ht.SubGraph} 子网对象
             */
            getCurrentSubGraph();

            /**
             * 传入逻辑坐标点或者交互event事件参数，返回当前点下的图元，filter可进行过滤
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @param {Functoin} [filter] 过滤器函数，传入data,自定义逻辑返回true或false判断此data是否可被getDataAt返回
             * @param {Number} [range] 扩大点范围
             * @return {ht.Data} 点下的图元
             */
            getDataAt(pointOrEvent, filter, range);

            /**
             * 获取绑定的数据模型
             * @return {ht.DataModel} 数据模型
             */
            getDataModel();

            /**
             * 获取逻辑坐标区域内的图元
             * @param {rect} rect 逻辑坐标区域
             * @param {Boolean} [intersects] 指定相交选中还是包含选中，true表示相交，false表示包含。
             * @param {Boolean} [selectable] 是否只返回可被选中的图元，可否被选中通过isSelectable判断
             * @return {ht.List}
             */
            getDatasInRect(rect, intersects, selectable);

            /**
             * 获取图元的UI类
             * @param {ht.Data} data 图元
             * @return {Object}
             */
            getDataUI(data);

            /**
             * 获取图元UI的绘制范围
             * @param {ht.Data} data 图元
             * @return {Object}
             */
            getDataUIBounds(data);

            /**
             * 获取编辑过滤器函数
             * @return {Function}
             */
            getEditableFunc();

            /**
             * 获取编辑交互器
             * @return {ht.graph.EditInteractor|ht.graph.XEditInteractor}
             */
            getEditInteractor();

            /**
             * 获取编辑交互器中编辑点的背景色
             * @return {color}
             */
            getEditPointBackground();

            /**
             * 获取编辑交互器中编辑点的边框颜色
             * @return {color}
             */
            getEditPointBorderColor();

            /**
             * 获取编辑交互器中编辑点的尺寸
             * @return {Object}
             */
            getEditPointSize();

            /**
             * 获取拓扑组件的布局高度
             * @return {Number}
             */
            getHeight();

            /**
             * 传入逻辑坐标点或者交互event事件参数、图元对象，判断当前点下的icon信息
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @example //返回值示例：
             * {
       * 	data: data,//相关数据元素
       * 	key: 'key',//styleIcon名
       * 	index: 0,//styleIcon中第几个icon
       * 	name: 'name'//styleIcon中相应icon的名字
       * }
             *
             * @return {Object}
             */
            getIconInfoAt(pointOrEvent, data);

            /**
             * 获取交互器
             * @return {ht.List}
             */
            getInteractors();

            /**
             * 获取图元的label，用于在拓扑上显示文字信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元label文字，默认返回data.s('label')||data.getName();
             */
            getLabel(data);

            /**
             * 获取图元的第二个label，用于在拓扑上显示文字，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元第二个label的文字，默认返回data.s('label2')
             */
            getLabel2(data);

            /**
             * 获取图元的第二个label的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个label的背景色，默认返回data.s('label2.background')
             */
            getLabel2Background(data);

            /**
             * 获取图元的第二个label的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个label的文字颜色，默认返回data.s('label2.color')
             */
            getLabel2Color(data);

            /**
             * 获取图元label的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元label的背景色，默认返回data.s('label.background')
             */
            getLabelBackground(data);

            /**
             * 获取图元label的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元label的文字颜色，默认返回data.s('label.color')
             */
            getLabelColor(data);

            /**
             * 获取拓扑中已定义的层
             * @return {Array}
             */
            getLayers();

            /**
             * 传入HTML事件对象，将事件坐标转换为拓扑中的逻辑坐标
             * @param {Event} event 事件对象
             * @return {Object}
             * @see {@link ht.graph.GraphView#lp lp}
             */
            getLogicalPoint(event);

            /**
             * 获取移动过滤器函数
             * @return {Function}
             */
            getMovableFunc();

            /**
             * 获取图元的note，用于在拓扑上显示标注信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元note文字，默认返回data.s('note')
             */
            getNote(data): string;

            /**
             * 获取图元的第二个note，用于在拓扑上显示标注信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元第二个note文字，默认返回data.s('note2')
             */
            getNote2(data): string;

            /**
             * 获取图元的第二个note的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个note的背景色，默认返回data.s('note2.background')
             */
            getNote2Background(data);

            /**
             * 获取图元note的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元note的文字颜色，默认返回data.s('note.background')
             */
            getNoteBackground(data);

            /**
             * 获取图元的透明度，可重载返回自定义透明度
             * @param {ht.Data} data 图元
             * @return {Number} 图元透明度，默认返回data.s('opacity')
             */
            getOpacity(data);

            /**
             * 获取点编辑(Shape、Edge等)过滤器函数
             * @return {Function}
             */
            getPointEditableFunc();

            /**
             * 获取大小编辑过滤器函数
             * @return {Function}
             */
            getRectEditableFunc();

            /**
             * 获取框选选择框的背景色
             * @return {color}
             */
            getRectSelectBackground();

            /**
             * 获取框选选择框的边框颜色
             * @return {color}
             */
            getRectSelectBorderColor();

            /**
             * 获取旋转编辑过滤器函数
             * @return {Function}
             */
            getRotationEditableFunc();

            /**
             * 获取图元编辑时的旋转控制点坐标
             * @param {ht.Data} data 图元
             * @return {Object} 旋转控制点坐标
             */
            getRotationPoint(data);

            /**
             * 获取滚动条颜色
             * @return {color}
             */
            getScrollBarColor();

            /**
             * 获取滚动条宽度
             * @return {Number}
             */
            getScrollBarSize();

            /**
             * 获取拓扑的滚动区域，即contentRect + viewRect
             * @return {Object} 矩形区域
             */
            getScrollRect();

            /**
             * 获取选择过滤器函数
             * @return {Function}
             */
            getSelectableFunc();

            /**
             * 传入逻辑坐标点或者交互event事件参数，返回当前点下已选中的图元
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @return {ht.Data}
             */
            getSelectedDataAt(pointOrEvent);

            /**
             * 获取选中模型
             * @return {ht.SelectionModel}
             * @see {@link ht.graph.GraphView#sm sm}
             */
            getSelectionModel();

            /**
             * 获取ToolTip文字，可重载返回自定义的toolTip文字
             * @param {Event} e 鼠标或Touch事件对象
             * @return {String} toolTip文字，默认取出鼠标下的图元，然后返回其getToolTip()
             */
            getToolTip(e);

            /**
             * 获取水平平移值
             * @return {Number} 水平平移值
             * @see {@link ht.graph.GraphView#tx tx}
             */
            getTranslateX();

            /**
             * 获取垂直平移值
             * @return {Number} 垂直平移值
             * @see {@link ht.graph.GraphView#ty ty}
             */
            getTranslateY();

            /**
             * 获取拓扑组件的根层div
             * @return {HTMLDivElement}
             */
            getView();

            /**
             * 获取拓扑组件中可见区域的逻辑尺寸
             * @return {Object}
             */
            getViewRect();

            /**
             * 获取可见过滤器函数
             * @return {Function}
             */
            getVisibleFunc();

            /**
             * 获取拓扑组件的布局宽度
             * @return {Number}
             */
            getWidth();

            /**
             * 获取拓扑整体缩放值
             * @return {Number}
             */
            getZoom();

            /**
             * 无效拓扑，并调用延时刷新
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.graph.GraphView#iv iv}
             */
            invalidate(delay?: number);

            /**
             * 无效拓扑中的所有图元
             */
            invalidateAll();

            /**
             * 无效拓扑中的图元
             * @param {ht.Data} data 要无效的图元
             */
            invalidateData(data);

            /**
             * 无效选中模型中的图元
             */
            invalidateSelection();

            /**
             * 是否自动隐藏滚动条
             * @return {Boolean}
             */
            isAutoHideScrollBar();

            /**
             * 选中图元时，是否自动平移拓扑以确保该图元出现在可见区域内
             * @return {Boolean}
             */
            isAutoMakeVisible();


            /**
             * 组件是否处于不可用状态，处于此状态时不能进行任何操作并且会遮挡一层蒙板
             * @return {Boolean}
             */
            isDisabled();

            /**
             * 判断图元是否可被编辑
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isEditable(data);

            /**
             * 图元编辑点是否可见，默认当拓扑缩放值大于0.15时可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isEditVisible(data);

            /**
             * 判断图元label是否可见，默认当拓扑缩放值大于0.15时可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isLabelVisible(data);

            /**
             * 判断图元是否可移动
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isMovable(data);

            /**
             * 判断图元note是否可见，默认当拓扑缩放值大于0.15时可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isNoteVisible(data);

            /**
             * 拓扑是否可以通过鼠标拖拽进行平移操作
             * @return {Boolean}
             */
            isPannable();

            /**
             * 判断图元(Shape、Edge等)的点是否可编辑
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isPointEditable(data);

            /**
             * 判断图元大小是否可编辑
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isRectEditable(data);

            /**
             * 判断拓扑上是否允许框选操作
             * @return {Boolean}
             */
            isRectSelectable();

            /**
             * 判断拓扑上是否允许通过空格将拓扑的缩放和平移值复位
             * @return {Boolean}
             */
            isResettable();

            /**
             * 判断图元是否可编辑旋转
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isRotationEditable(data);

            /**
             * 判断拓扑滚动条是否可见
             * @return {Boolean}
             */
            isScrollBarVisible();

            /**
             * 判断图元是否可被选中
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelectable(data);

            /**
             * 判断图元是否被选中
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelected(data);

            /**
             * 根据id判断图元是否被选中
             * @param {String|Number} id 图元id
             * @return {Boolean}
             */
            isSelectedById(id);

            /**
             * 当前拓扑是否共享选中模型
             * @return {Boolean}
             */
            isSelectionModelShared();

            /**
             * 拓扑中的图元的选中边框是否可见，默认当拓扑缩放值大于0.15时可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelectVisible(data);

            /**
             * 判断图元是否可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isVisible(data);

            /**
             * 无效拓扑，并调用延时刷新，{@link ht.graph.GraphView#invalidate invalidate}的缩写
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.graph.GraphView#invalidate invalidate}
             */
            iv(delay);

            /**
             * 传入HTML事件对象，将事件坐标转换为拓扑中的逻辑坐标，{@link ht.graph.GraphView#getLogicalPoint getLogicalPoint}的缩写
             * @param {Event} event 事件对象
             * @return {Object}
             * @see {@link ht.graph.GraphView#getLogicalPoint getLogicalPoint}
             */
            lp(event);

            /**
             * 平移拓扑以确保该图元在可见区域内
             * @param {ht.Data} data 图元
             */
            makeVisible(data);

            /**
             * 增加交互事件监听器，{@link ht.graph.GraphView#addInteractorListener addInteractorListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph.GraphView#addInteractorListener addInteractorListener}
             * @example //示例：
             * graphView.mi(function(event) {
       * 		//event格式：
       * 		{
       * 			//clickData, doubleClickData, clickBackground, doubleClickBackground,
       * 			//beginRectSelect, betweenRectSelect, endRectSelect, beginMove, betweenMove, endMove,
       * 			//beginPan, betweenPan, endPan, beginEditRect, betweenEditRect, endEditRect, beginEditPoint, betweenEditPoint, endEditPoint
       * 			//beginEditRotation, betweenEditRotation, endEditRotation, moveLeft, moveRight, moveUp, moveDown, toggleNote, toggleNote2
       * 			kind: 'clickData',//事件类型
       * 			data: data,//事件相关的数据元素
       * 			part: "part",//事件的区域,icon、label等
       * 			event: e//html原生事件
       * 		}
       * });
             */
            mi(listener, scope, ahead);

            /**
             * 移动选中模型中图元的位置
             * @param {Number} offsetX 水平移动值
             * @param {Number} offsetY 垂直移动值
             */
            moveSelection(offsetX, offsetY);

            /**
             * 增加自身属性变化事件监听器，{@link ht.graph.GraphView#addPropertyChangeListener addPropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph.GraphView#addPropertyChangeListener addPropertyChangeListener}
             */
            mp(listener, scope, ahead);

            /**
             * 自动布局动画结束后时回调，可重载做后续处理
             */
            onAutoLayoutEnded();

            /**
             * 单击拓扑背景时回调，可重载做后续处理
             * @param {Event} event 事件对象
             */
            onBackgroundClicked(event);

            /**
             * 双击拓扑背景时回调，默认调用upSubGraph()进入上一层子网，可重载改变默认逻辑或做后续处理
             * @param {Event} event 事件对象
             */
            onBackgroundDoubleClicked(event);

            /**
             * 当前子网变化时回调，默认实现调用reset()恢复默认缩放和平移值，可重载改变默认逻辑或做后续处理
             * @param {Event} event 事件对象
             */
            onCurrentSubGraphChanged(event);

            /**
             * 图元被点击时回调，可重载做后续处理
             * @param {ht.Data} data 被点击的图元
             * @param {Event} e 事件对象
             */
            onDataClicked(data, e);

            /**
             * 图元被双击时回调，可重载做后续处理
             * @param {ht.Data} data 双击的图元
             * @param {Event} e 事件对象
             */
            onDataDoubleClicked(data, e);

            /**
             * 连线图元被双击时回调，默认调用edge.toggle()，可重载改变默认逻辑或做后续处理
             * @param {ht.Edge} edge 连线
             * @param {Event} e 事件对象
             */
            onEdgeDoubleClicked(edge, e);

            /**
             * 组类型图元被双击时回调，默认实现调用group.toggle()，可重载改变默认逻辑或做后续处理
             * @param {ht.Group} group Group对象
             * @param {Event} e 事件对象
             */
            onGroupDoubleClicked(group, e);

            /**
             * 移动图元位置结束时回调，可重载做后续处理
             */
            onMoveEnded();

            /**
             * 手抓图平移拓扑图结束时回调，可重载做后续处理
             */
            onPanEnded();

            /**
             * 触屏进行双指缩放结束时回调，可重载做后续处理
             */
            onPinchEnded();

            /**
             * 框选结束时回调，可重载做后续处理
             */
            onRectSelectEnded();

            /**
             * 选中变化时回调，默认实现会使得该选中图元出现在拓扑图上的可见范围
             * @param {Event} event 选中变化事件对象
             */
            onSelectionChanged(event);

            /**
             * 子网图元被双击时回调，默认实现进入子网
             * @param {ht.SubGraph} subGraph 子网对象
             * @param {Event} event 事件对象
             */
            onSubGraphDoubleClicked(subGraph, event);

            /**
             * 平移动画结束时回调，可重载做后续处理
             */
            onTranslateEnded();

            /**
             * 图元可见状态发生变化时回调，可重载做后续处理
             * @param {ht.Data} data 图元
             * @param {Boolean} newVisible 新的可见状态
             */
            onVisibleChanged(data, newVisible);

            /**
             * 缩放动画结束时回调
             */
            onZoomEnded();

            /**
             * 判断图元是否在矩形范围内
             * @param {ht.Data} data 图元
             * @param {Object} rect 矩形
             * @return {Boolean}
             */
            rectContains(data, rect);

            /**
             * 判断图元与矩形范围是否相交
             * @param {ht.Data} data 图元
             * @param {Object} rect 矩形
             * @return {Boolean}
             */
            rectIntersects(data, rect);

            /**
             * 重绘拓扑，rect参数为空时重绘拓扑中的所有图元，否则重绘矩形范围内的图元
             * @param {Object} [rect] 矩形范围
             */
            redraw(rect);

            /**
             * 删除底层Painter
             * @param {Object} painter Painter类
             */
            removeBottomPainter(painter);

            /**
             * 删除交互事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph.GraphView#umi umi}
             */
            removeInteractorListener(listener, scope);

            /**
             * 删除自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removePropertyChangeListener(listener, scope);

            /**
             * 删除所有选中的图元
             */
            removeSelection();

            /**
             * 删除顶层Painter
             * @param {Object} painter Painter类
             */
            removeTopPainter(painter);

            /**
             * 删除视图事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removeViewListener(listener, scope);

            /**
             * 重置拓扑状态，将zoom设为1，translate设为0
             */
            reset();

            /**
             * 提供一个回调函数倒序遍历此拓扑中的图元，与DataModel上的each方法不同，此方法还考虑了拓扑中的Layer，从高Layer向低Layer遍历
             * @param {Function} func 遍历函数
             * @param {Object} [scope] 函数域
             * @example graphView.reverseEach(function(data) {
       *   console.log(data);
       * });
             */
            reverseEach(func, scope);

            /**
             * 选中拓扑中所有图元
             */
            selectAll();

            /**
             * 设置是否自动隐藏滚动条
             * @param {Boolean} v
             */
            setAutoHideScrollBar(v);


            /**
             * 设置当选中图元时，是否自动平移拓扑以确保该图元出现在可见区域内
             * @param {Boolean} v
             */
            setAutoMakeVisible(v);


            /**
             * 设置自动滚动区域大小，当鼠标距离拓扑边缘小于这个值时，拓扑自动滚动(调整translateX或translateY)
             * @param {Boolean} v
             */
            setAutoScrollZone(v);

            /**
             * 设置当前子网
             * @param {ht.SubGraph} subGraph 子网对象
             */
            setCurrentSubGraph(subGraph);

            /**
             * 设置绑定的数据模型
             * @return {ht.DataModel} 数据模型
             */
            setDataModel(dataModel);

            /**
             * 设置组件是否处于不可用状态，处于不可用状态时不能进行任何操作并且会遮挡一层蒙板
             * @param {Boolean} value 是否禁用组件
             * @param {String} [iconUrl] 蒙板上显示的icon的路径
             */
            setDisabled(value, iconUrl);
            /**
             * 设置拓扑中的图元是否可编辑
             * @param {Boolean} editable
             */
            setEditable(editable);

            /**
             * 设置编辑过滤器函数
             * @param {Function} func 过滤器函数
             */
            setEditableFunc(func);

            /**
             * 设置编辑交互器中编辑点的背景色
             * @param {color} color 颜色值
             */
            setEditPointBackground(color);

            /**
             * 设置编辑交互器中编辑点的边框颜色
             * @param {color} color 颜色值
             */
            setEditPointBorderColor(color);

            /**
             * 设置编辑交互器中编辑点的尺寸
             * @param {Number} size 编辑点尺寸
             */
            setEditPointSize(size);

            /**
             * 设置布局高度
             * @param {Number} height 高度值
             */
            setHeight(height);

            /**
             * 设置交互器
             * @param {ht.List} interactors 交互器对象集合
             */
            setInteractors(interactors);

            /**
             * 定义拓扑中的层，参数为数组，数组中每个元素代表一个层，层在数组中的索引越大，在拓扑中就越靠上显示<br>
             * 注意，图元的默认layer是0，因此如果定义的层中不包含0，所有的图元默认将不可见
             * @param {Array} layers 层数组
             * @example
             * graphView.setLayers([0, 1, 'Layer2']);
             * node.setLayer(1);
             * node2.setLayer('Layer2');
             */
            setLayers(layers);

            /**
             * 设置移动过滤器函数
             * @param {Function} func 过滤器函数
             */
            setMovableFunc(func);

            /**
             * 设置是否可以通过鼠标拖拽进行平移操作
             * @param {Boolean} v 是否可平移
             */
            setPannable(v);

            /**
             * 设置点编辑(Shape、Edge等)过滤器函数
             * @param {Function} func 过滤器函数
             */
            setPointEditableFunc(func);

            /**
             * 设置大小编辑过滤器函数
             * @param {Function} func 过滤器函数
             */
            setRectEditableFunc(func);

            /**
             * 设置拓扑上是否允许框选操作
             * @param {Boolean} v
             */
            setRectSelectable(v);

            /**
             * 设置框选选择框的背景色
             * @param {color} color 颜色值
             */
            setRectSelectBackground(color);

            /**
             * 设置框选选择框的边框颜色
             * @param {color} color 颜色值
             */
            setRectSelectBorder(color);

            /**
             * 设置拓扑上是否允许通过空格将拓扑的缩放和平移值复位
             * @param {Boolean} v
             */
            setResettable(v);

            /**
             * 设置旋转编辑过滤器函数
             * @param {Function} func 过滤器函数
             */
            setRotationEditableFunc(func);

            /**
             * 设置滚动条颜色
             * @param {color} color 颜色值
             */
            setScrollBarColor(color);

            /**
             * 设置滚动条宽度
             * @param {Number} size 宽度值
             */
            setScrollBarSize(size);

            /**
             * 设置滚动条是否可见
             * @param {Boolean} visible
             */
            setScrollBarVisible(visible);

            /**
             * 设置选择过滤器函数
             * @param {Function} func 过滤器函数
             */
            setSelectableFunc(func);

            /**
             * 设置拓扑是否共享选中模型
             * @param {Boolean} v
             */
            setSelectionModelShared(v);

            /**
             * 设置拓扑水平和垂直平移值
             * @param {Number} x 水平平移值
             * @param {Number} y 垂直平移值
             * @param {Boolean} [anim] 是否使用动画
             */
            setTranslate(x, y, anim);

            /**
             * 设置拓扑水平平移值
             * @param {Number} x 水平平移值
             */
            setTranslateX(x);

            /**
             * 设置拓扑垂直平移值
             * @param {Number} y 垂直平移值
             */
            setTranslateY(y);

            /**
             * 设置可见过滤器
             * @param {Function} func 过滤器函数
             */
            setVisibleFunc(func);

            /**
             * 设置布局宽度
             * @param {Number} width 宽度值
             */
            setWidth(width);

            /**
             * 设置拓扑缩放值
             * @param {Number} value 缩放值
             * @param {Boolean} [anim] 是否使用动画
             * @param {Object} [point] 缩放中心点的坐标
             */
            setZoom(value, anim, point);

            /**
             * 显示滚动条
             */
            showScrollBar();

            /**
             * 获取选中模型，{@link ht.graph.GraphView#getSelectionModel getSelectionModel}的缩写
             * @see {@link ht.graph.GraphView#getSelectionModel getSelectionModel}
             * @return {ht.SelectionModel}
             */
            sm();

            /**
             * 将拓扑导出为canvas
             * @param {color} background 背景色
             * @return {HTMLCanvasElement}
             */
            toCanvas(background);

            /**
             * 将拓扑导出为base64格式字符串
             * @param {color} background 背景色
             * @return {String}
             */
            toDataURL(background);

            /**
             * 在当前值基础上增加水平和垂直平移值
             * @param {Number} x 新增的水平平移值
             * @param {Number} y 新增的垂直平移值
             * @param {Boolean} [anim] 是否使用动画
             */
            translate(x, y, anim);

            /**
             * 获取或设置水平平移值，没有参数时相当于{@link ht.graph.GraphView#getTranslateX getTranslateX}，有参数时相当于{@link ht.graph.GraphView#setTranslateX setTranslateX}
             * @param {Number} value 平移值
             */
            tx(value);

            /**
             * 获取或设置垂直平移值，没有参数时相当于{@link ht.graph.GraphView#getTranslateY getTranslateY}，有参数时相当于{@link ht.graph.GraphView#setTranslateY setTranslateY}
             * @param {Number} value 平移值
             */
            ty(value);

            /**
             * 删除交互事件监听器，{@link ht.graph.GraphView#removeInteractorListener removeInteractorListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph.GraphView#removeInteractorListener removeInteractorListener}
             */
            umi(listener, scope);

            /**
             * 删除自身属性变化事件监听器，{@link ht.graph.GraphView#removePropertyChangeListener removePropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph.GraphView#removePropertyChangeListener removePropertyChangeListener}
             */
            ump(listener, scope);

            /**
             * 立刻刷新拓扑
             */
            validate();

            /**
             * 放大拓扑
             * @param {Boolean} [anim] 是否使用动画
             * @param {Object} [point] 缩放中心点的坐标
             */
            zoomIn(anim?, point?);

            /**
             * 缩小拓扑
             * @param {Boolean} [anim] 是否使用动画
             * @param {Object} [point] 缩放中心点的坐标
             */
            zoomOut(anim?, point?);

            /**
             * 将拓扑缩放值改为1
             * @param {Boolean} [anim] 是否使用动画
             * @param {Object} [point] 缩放中心点的坐标
             */
            zoomReset(anim, point);
        }
    }
    namespace graph3d {


        /**
         * 3D渲染引擎组件，可视化呈现数据模型的三维环境场景
         * @param {ht.DataModel} dataModel 绑定的数据模型
         * @constructor
         */
        export class Graph3dView {

            constructor(dataModel?: ht.DataModel);
            /**
             * 增加交互事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph3d.Graph3dView#mi mi}
             * @example //示例：
             * graph3dView.addInteractorListener(function(event) {
       * 		//event格式：
       * 		{
       * 			kind: 'clickData',//事件类型
       * 			data: data,//事件相关的数据元素
       * 			part: "part",//事件的区域,icon、label等
       * 			event: e//html原生事件
       * 		}
       * });
             */
            addInteractorListener(listener, scope, ahead);

            /**
             * 增加自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph3d.Graph3dView#mp mp}
             */
            addPropertyChangeListener(listener, scope, ahead);

            /**
             * 监听视图事件，如布局、刷新等
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             */
            addViewListener(listener, scope, ahead);

            /**
             * 关闭ToolTip功能
             */
            disableToolTip();

            /**
             * 获取或设置数据模型，没有参数时相当于{@link ht.graph3d.Graph3dView#getDataModel getDataModel}，有参数时相当于{@link ht.graph3d.Graph3dView#setDataModel setDataModel}
             * @param {ht.DataModel} [dataModel] 数据模型
             * @return {ht.DataModel} dataModel
             */
            dm(dataModel);

            /**
             * 启用ToolTip
             */
            enableToolTip();

            /**
             * 获取截头锥体的宽高比
             * @return {Number}
             */
            getAspect();

            /**
             * 获取x轴线颜色
             * @return {color}
             */
            getAxisXColor();

            /**
             * 获取y轴线颜色
             * @return {color}
             */
            getAxisYColor();

            /**
             * 获取z轴线颜色
             * @return {color}
             */
            getAxisZColor();

            /**
             * 获取碰撞边界
             * @return {Array}
             */
            getBoundaries();

            /**
             * 获取图元最终亮度，默认为1,大于1变亮，小于1变暗
             * @param {ht.Data} data 图元
             * @return {Number}
             */
            getBrightness(data);

            /**
             * 获取渲染的画布
             * @return {HTMLCanvasElement} 画布
             */
            getCanvas();

            /**
             * 获取拓扑中心点
             * @return {Array} 中心点坐标，格式：[x, y, z]
             */
            getCenter();

            /**
             * 获取当前子网
             * @return {ht.SubGraph} 子网对象
             */
            getCurrentSubGraph();

            /**
             * 传入逻辑坐标点或者交互event事件参数，返回当前点下的图元
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @return {ht.Data} 点下的图元
             */
            getDataAt(pointOrEvent);

            /**
             * 传入逻辑坐标点或者交互event事件参数，返回当前点下的图元及part信息
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @return {Object} 图元和part信息
             */
            getDataInfoAt(pointOrEvent);

            /**
             * 获取绑定的数据模型
             * @return {ht.DataModel} 数据模型
             */
            getDataModel();

            /**
             * 获取矩形区域内的图元
             * @param {rect} rect 逻辑坐标区域
             * @return {ht.List}
             */
            getDatasInRect(rect);

            /**
             * 获取编辑过滤器函数
             * @return {Function}
             */
            getEditableFunc();

            /**
             * 获取大小编辑控制条的颜色
             * @return {color}
             */
            getEditSizeColor();

            /**
             * 获取眼睛（或Camera）所在位置，默认值为[0, 300, 1000]
             * @return {Array} 眼睛位置坐标，格式[x, y, z]
             */
            getEye();

            /**
             * 获取远端截面位置，默认值为10000
             * @return {Number}
             */
            getFar();

            /**
             * 获取垂直方向的视觉张角弧度，默认值为Math.PI/4
             * @return {Number}
             */
            getFovy();

            /**
             * 获取网格线颜色
             * @return {color}
             */
            getGridColor();

            /**
             * 获取网格线间距
             * @return {Number}
             */
            getGridGap();

            /**
             * 获取网格行列数，默认为40
             * @return {Number}
             */
            getGridSize();

            /**
             * 获取拓扑组件的布局高度
             * @return {Number}
             */
            getHeight();

            /**
             * 获取交互器
             * @return {ht.List}
             */
            getInteractors();

            /**
             * 获取图元的label，用于在拓扑上显示文字信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元label文字，默认返回data.s('label')||data.getName();
             */
            getLabel(data);

            /**
             * 获取图元的第二个label，用于在拓扑上显示文字，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元第二个label的文字，默认返回data.s('label2')
             */
            getLabel2(data);

            /**
             * 获取图元的第二个label的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个label的背景色，默认返回data.s('label2.background')
             */
            getLabel2Background(data);

            /**
             * 获取图元的第二个label的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个label的文字颜色，默认返回data.s('label2.color')
             */
            getLabel2Color(data);

            /**
             * 获取图元label的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元label的背景色，默认返回data.s('label.background')
             */
            getLabelBackground(data);

            /**
             * 获取图元label的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元label的文字颜色，默认返回data.s('label.color')
             */
            getLabelColor(data);

            /**
             * 获取移动过滤器函数
             * @return {Function}
             */
            getMovableFunc();

            /**
             * 获取移动漫游步进
             * @return {Number}
             */
            getMoveStep();

            /**
             * 获取近端截面位置，默认值为10
             * @return {Number}
             */
            getNear();

            /**
             * 获取图元的note，用于在拓扑上显示标注信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元note文字，默认返回data.s('note')
             */
            getNote(data);

            /**
             * 获取图元的第二个note，用于在拓扑上显示标注信息，可重载返回自定义文字
             * @param {ht.Data} data 图元
             * @return {String} 图元第二个note文字，默认返回data.s('note2')
             */
            getNote2(): string;

            /**
             * 获取图元的第二个note的背景色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元第二个note的背景色，默认返回data.s('note2.background')
             */
            getNote2Background(data);

            /**
             * 获取图元note的文字颜色，可重载返回自定义颜色
             * @param {ht.Data} data 图元
             * @return {color} 图元note的文字颜色，默认返回data.s('note.background')
             */
            getNoteBackground(data);

            /**
             * 获取图元的透明度，可重载返回自定义透明度
             * @param {ht.Data} data 图元
             * @return {Number} 图元透明度，默认返回data.s('opacity')
             */
            getOpacity(data);

            /**
             * 获取正交投影宽度，默认为2000
             * @return {Number}
             */
            getOrthoWidth();

            /**
             * 获取框选选择框的背景色
             * @return {color}
             */
            getRectSelectBackground();

            /**
             * 获取旋转编辑过滤器函数
             * @return {Function}
             */
            getRotationEditableFunc();

            /**
             * 获取选择过滤器函数
             * @return {Function}
             */
            getSelectableFunc();

            /**
             * 获取选中模型
             * @return {ht.SelectionModel}
             * @see {@link ht.graph3d.Graph3dView#sm sm}
             */
            getSelectionModel();

            /**
             * 获取大小编辑过滤器
             * @return {Function}
             */
            getSizeEditableFunc();

            /**
             * 获取组件内部的贴图映射表
             * @return {Object}
             */
            getTextureMap();

            /**
             * 获取ToolTip文字，可重载返回自定义的toolTip文字
             * @param {Event} e 鼠标或Touch事件对象
             * @return {String} toolTip文字，默认取出鼠标下的图元，然后返回其getToolTip()
             */
            getToolTip(e);

            /**
             * 获取摄像头正上方向，该参数一般较少改动，默认值为[0, 1, 0]
             * @return {Array} 格式：[x, y, z]
             */
            getUp();

            /**
             * 获取拓扑组件的根层div
             * @return {HTMLDivElement}
             */
            getView();

            /**
             * 获取可见过滤器函数
             * @return {Function}
             */
            getVisibleFunc();

            /**
             * 获取拓扑组件的布局宽度
             * @return {Number}
             */
            getWidth();

            /**
             * 定义图元立体线框效果
             * @param {ht.Data} data 数据元素
             * @example //示例:
             * g3d.getWireframe(data){
       * var visible = data.s('wf.visible');
       *  if(visible === true || (visible === 'selected' && this.isSelected(data))){
       *      return {
       *          color: data.s('wf.color'),
       *          width: data.s('wf.width'),
       *          short: data.s('wf.short'),
       *          mat: data.s('wf.mat')
       *      };
       *  }
       * },
             * @return {Object}
             */
            getWireframe(data);

            /**
             * 无效拓扑，并调用延时刷新
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.graph3d.Graph3dView#iv iv}
             */
            invalidate(delay);

            /**
             * 无效拓扑中的所有图元
             */
            invalidateAll();

            /**
             * 无效拓扑中的图元
             * @param {ht.Data} data 要无效的图元
             */
            invalidateData(data);

            /**
             * 无效选中模型中的图元
             */
            invalidateSelection();

            /**
             * 选中图元时，是否自动平移拓扑以确保该图元出现在可见区域内
             * @return {Boolean}
             */
            isAutoMakeVisible();

            /**
             * 是否显示中心点轴线
             * @return {Boolean}
             */
            isCenterAxisVisible();


            /**
             * 组件是否处于不可用状态，处于此状态时不能进行任何操作并且会遮挡一层蒙板
             * @return {Boolean}
             */
            isDisabled();

            /**
             * 判断图元是否可被编辑
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isEditable(data);

            /**
             * 是否是第一人称模式
             * @return {Boolean}
             */
            isFirstPersonMode();

            /**
             * 是否显示网格
             * @return {Boolean}
             */
            isGridVisible();

            /**
             * 判断图元是否可移动
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isMovable(data);

            /**
             * 是否使用鼠标漫游，默认为true, 如果改为false, 则鼠标左键右键都不支持前进后退的操作功能，
             * 但左键可拖拽编辑图元，右键可改变视角方向，采用这样的方式一般会结合键盘w|s|a|d按键进行漫游操作
             * @return {Boolean}
             */
            isMouseRoamable();


            /**
             * 是否显示坐标原点[0,0,0]轴线
             * @return {Boolean}
             */
            isOriginAxisVisible();

            /**
             * 是否使用正交投影
             * @return {Boolean}
             */
            isOrtho();

            /**
             * 是否允许平移操作
             * @return {Boolean}
             */
            isPannable();

            /**
             * 是否允许框选操作
             * @return {Boolean}
             */
            isRectSelectable();

            /**
             * 判断是否允许通过空格将拓扑复位
             * @return {Boolean}
             */
            isResettable();

            /**
             * 是否可旋转
             * @return {Boolean}
             */
            isRotatable();

            /**
             * 获取旋转步进
             * @return {Number}
             */
            getRotateStep();


            /**
             * 判断图元是否可编辑旋转
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isRotationEditable(data);

            /**
             * 判断图元是否可被选中
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelectable(data);

            /**
             * 判断图元是否被选中
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelected(data);

            /**
             * 根据id判断图元是否被选中
             * @param {String|Number} id 图元id
             * @return {Boolean}
             */
            isSelectedById(id);

            /**
             * 当前拓扑是否共享选中模型
             * @return {Boolean}
             */
            isSelectionModelShared();

            /**
             * 图元是否可编辑大小
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSizeEditable(data);

            /**
             * 判断图元是否可见
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isVisible(data);

            /**
             * 是否可进退
             * @return {Boolean}
             */
            isWalkable();

            /**
             * 是否可缩放
             * @return {Boolean}
             */
            isZoomable();


            /**
             * 无效拓扑，并调用延时刷新，{@link ht.graph3d.Graph3dView#invalidate invalidate}的缩写
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.graph3d.Graph3dView#invalidate invalidate}
             */
            iv(delay);

            /**
             * 平移拓扑以确保该图元在可见区域内
             * @param {ht.Data} data 图元
             */
            makeVisible(data);

            /**
             * 增加交互事件监听器，{@link ht.graph3d.Graph3dView#addInteractorListener addInteractorListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph3d.Graph3dView#addInteractorListener addInteractorListener}
             * @example //示例：
             * graph3dView.mi(function(event) {
       * 		//event格式：
       * 		{
       * 			kind: 'clickData',//事件类型
       * 			data: data,//事件相关的数据元素
       * 			part: "part",//事件的区域,icon、label等
       * 			event: e//html原生事件
       * 		}
       * });
             */
            mi(listener, scope, ahead);

            /**
             * 移动选中模型中图元的位置
             * @param {Number} dx x轴方向移动值
             * @param {Number} dy y轴方向移动值
             * @param {Number} dz z轴方向移动值
             */
            moveSelection(dx, dy, dz);

            /**
             * 增加自身属性变化事件监听器，{@link ht.graph3d.Graph3dView#addPropertyChangeListener addPropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.graph3d.Graph3dView#addPropertyChangeListener addPropertyChangeListener}
             */
            mp(listener, scope, ahead);

            /**
             * 自动布局动画结束后时回调，可重载做后续处理
             */
            onAutoLayoutEnded();

            /**
             * 单击拓扑背景时回调，可重载做后续处理
             * @param {Event} event 事件对象
             */
            onBackgroundClicked(event);

            /**
             * 双击拓扑背景时回调，默认调用upSubGraph()进入上一层子网，可重载改变默认逻辑或做后续处理
             * @param {Event} event 事件对象
             */
            onBackgroundDoubleClicked(event);

            /**
             * 图元被点击时回调，可重载做后续处理
             * @param {ht.Data} data 被点击的图元
             * @param {Event} e 事件对象
             * @param {Object} part 区域
             */
            onDataClicked(data, e, part);

            /**
             * 图元被双击时回调，可重载做后续处理
             * @param {ht.Data} data 双击的图元
             * @param {Event} e 事件对象
             * @param {Object} part 区域
             */
            onDataDoubleClicked(data, e, part);

            /**
             * 连线图元被双击时回调，默认调用edge.toggle()，可重载改变默认逻辑或做后续处理
             * @param {ht.Edge} edge 连线
             * @param {Event} e 事件对象
             * @param {Object} part 区域
             */
            onEdgeDoubleClicked(edge, e, part);

            /**
             * 组类型图元被双击时回调，默认实现调用group.toggle()，可重载改变默认逻辑或做后续处理
             * @param {ht.Group} group Group对象
             * @param {Event} e 事件对象
             * @param {Object} part 区域
             */
            onGroupDoubleClicked(group, e, part);

            /**
             * 移动图元位置结束时回调，可重载做后续处理
             */
            onMoveEnded();

            /**
             * 手抓图平移拓扑图结束时回调，可重载做后续处理
             */
            onPanEnded();

            /**
             * 触屏进行双指缩放结束时回调，可重载做后续处理
             */
            onPinchEnded();

            /**
             * 框选结束时回调，可重载做后续处理
             */
            onRectSelectEnded();

            /**
             * 旋转结束时回调，可重载做后续处理
             */
            onRotateEnded();

            /**
             * 选中变化时回调，默认实现会使得该选中图元出现在拓扑图上的可见范围
             * @param {Event} event 选中变化事件对象
             */
            onSelectionChanged(event);

            /**
             * 子网图元被双击时回调，默认实现进入子网
             * @param {ht.SubGraph} subGraph 子网对象
             * @param {Event} event 事件对象
             * @param {Object} part 区域
             */
            onSubGraphDoubleClicked(subGraph, event, part);

            /**
             * 进退操作结束时回调，可重载做后续处理
             * @param {ht.SubGraph} subGraph 子网对象
             * @param {Event} event 事件对象
             */
            onWalkEnded();

            /**
             * 缩放动画结束时回调
             */
            onZoomEnded();

            /**
             * 上下左右四个方向的平移，本质为eye和center同时做四个方向的相同偏移量，
             * dx左右偏移参数，dy上下偏移参数，dx和dy一般代表屏幕移动像素，
             * Graph3dView自动会换算成合理的3D空间逻辑坐标偏移量。<br>
             * firstPersonMode参数为空时则默认采用Graph3dView#isFirstPersonMode()当前值，
             * 如果为第一人称模式调用pan操作，该函数会考虑Graph3dView#getBoundaries()边界限制。
             * @param  {dx} dx x轴方向的偏移量
             * @param  {dy} dy y轴方向的偏移量
             * @param  {Boolean} [anim] 是否使用动画
             * @param  {Boolean} [firstPersonMode] 是否第一人称模式
             */
            pan(dx, dy, anim, firstPersonMode);


            /**
             * 重绘拓扑
             */
            redraw();

            /**
             * 删除交互事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph3d.Graph3dView#umi umi}
             */
            removeInteractorListener(listener, scope);

            /**
             * 删除自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removePropertyChangeListener(listener, scope);

            /**
             * 删除所有选中的图元
             */
            removeSelection();

            /**
             * 删除视图事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removeViewListener(listener, scope);

            /**
             * 复位函数，调用该函数将eye、center和up三个变量设置为ht.Default上对应的 graph3dViewCenter、graph3dViewEye和graph3dViewUp初始默认值。
             */
            reset();

            /**
             * 上下左右四个方位旋转一定角度
             * @param {Number} leftRight 水平旋转弧度
             * @param {Number} upDown 垂直旋转弧度
             * @param {Boolean} anim 是否使用动画
             * @param {Boolean} firstPersonMode 是否第一人称模式，为空时则采用Graph3dView#isFirstPersonMode()，该参数将影响旋转移动的参照标准，为默认非第一人称模式时， 旋转是以center为中心进行旋转，也就是围绕中心物体旋转，当为第一人称时旋转以eye为中心进行旋转，也就是旋转眼睛朝向方向。
             */
            rotate(leftRight, upDown, anim, firstPersonMode);

            /**
             * 选中拓扑中所有图元
             */
            selectAll();


            /**
             * 设置截头锥体的宽高比，该参数默认自动根据屏幕的宽高比决定，一般不需要设置。
             * @param {Number} v
             */
            setAspect(v);

            /**
             * 设置当选中图元时，是否自动平移拓扑以确保该图元出现在可见区域内
             * @param {Boolean} v
             */
            setAutoMakeVisible(v);

            /**
             * 设置x轴线颜色
             * @param {color} color
             */
            setAxisXColor(color);

            /**
             * 设置y轴线颜色
             * @param {color} color
             */
            setAxisYColor();

            /**
             * 设置z轴线颜色
             * @param {color} color
             */
            setAxisZColor();


            /**
             * 设置碰撞边界
             * @param {Array} boundaries 边界数组
             * @example //示例：
             * g3d.setBoundaries([
             *   [
             *       p0.x, p0.y,
             *       p1.x, p1.y,
             *       p2.x, p2.y,
             *       p3.x, p3.y
             *   ],
             *   [
             *       p4.x, p4.y,
             *       p5.x, p5.y,
             *       p6.x, p6.y
             *   ]
             * ]);
             */
            setBoundaries(boundaries);

            /**
             * 设置中心点
             * @param {Array} center 中心点坐标，格式：[x, y, z]
             */
            setCenter(center);

            /**
             * 设置是否显示中心点轴线
             * @param {Boolean} v
             */
            setCenterAxisVisible(v);

            /**
             * 设置当前子网
             * @param {ht.SubGraph} subGraph 子网对象
             */
            setCurrentSubGraph(subGraph);

            /**
             * 设置绑定的数据模型
             * @return {ht.DataModel} 数据模型
             */
            setDataModel(dataModel);

            /**
             * 设置组件是否处于不可用状态，处于不可用状态时不能进行任何操作并且会遮挡一层蒙板
             * @param {Boolean} value 是否禁用组件
             * @param {String} [iconUrl] 蒙板上显示的icon的路径
             */
            setDisabled(value, iconUrl);

            /**
             * 设置拓扑中的图元是否可编辑
             * @param {Boolean} editable
             */
            setEditable(editable);

            /**
             * 设置编辑过滤器函数
             * @param {Function} func 过滤器函数
             */
            setEditableFunc(func);

            /**
             * 设置大小编辑控制条的颜色
             * @param {color} color
             */
            setEditSizeColor(color);

            /**
             * 设置眼睛（或Camera）所在位置，默认值为[0, 300, 1000]
             * @param {Array} eye 眼睛位置坐标，格式[x, y, z]
             */
            setEye(eye);

            /**
             * 设置远端截面位置，默认值为10000
             * @param {Number} far
             */
            setFar(far);

            /**
             * 设置第一人称模式
             * @param {Boolean} mode
             */
            setFirstPersonMode(mode);

            /**
             * 设置垂直方向的视觉张角弧度，默认值为Math.PI/4
             * @param {Number} fovy
             */
            setFovy(fovy);

            /**
             * 设置网格线颜色
             * @param {color} color
             */
            setGridColor(color);

            /**
             * 设置网格线间距
             * @param {Number} gap
             */
            setGridGap(gap);

            /**
             * 设置网格行列数，默认为40
             * @param {Number} size
             */
            setGridSize(size);

            /**
             * 设置是否显示网格
             * @param {Boolean} v
             */
            setGridVisible(v);

            /**
             * 设置布局高度
             * @param {Number} height 高度值
             */
            setHeight(height);

            /**
             * 设置交互器
             * @param {ht.List} interactors 交互器对象集合
             */
            setInteractors(interactors);

            /**
             * 设置是否使用鼠标漫游，默认为true, 如果改为false, 则鼠标左键右键都不支持前进后退的操作功能，
             * 但左键可拖拽编辑图元，右键可改变视角方向，采用这样的方式一般会结合键盘w|s|a|d按键进行漫游操作
             * @param {Boolean} v
             */
            setMouseRoamable(v);

            /**
             * 设置移动过滤器函数
             * @param {Function} func 过滤器函数
             */
            setMovableFunc(func);

            /**
             * 设置移动漫游步进
             * @param {Number} v
             */
            setMoveStep(v);

            /**
             * 设置近端截面位置，默认值为10
             * @param {Number} v
             */
            setNear(v);

            /**
             * 设置是否显示坐标原点[0,0,0]轴线
             * @param {Boolean} v
             */
            setOriginAxisVisible(v);

            /**
             * 设置是否使用正交投影
             * @param {Boolean} v
             */
            setOrtho(v);

            /**
             * 设置正交投影宽度，默认为2000
             * @param {Number} width
             */
            setOrthoWidth(width);

            /**
             * 设置是否允许平移操作
             * @param {Boolean} v 是否可平移
             */
            setPannable(v);

            /**
             * 设置拓扑上是否允许框选操作
             * @param {Boolean} v
             */
            setRectSelectable(v);

            /**
             * 设置框选选择框的背景色
             * @param {color} color 颜色值
             */
            setRectSelectBackground(color);

            /**
             * 设置是否允许通过空格将拓扑复位
             * @param {Boolean} v
             */
            setResettable(v);

            /**
             * 设置是否可旋转
             * @param {Boolean} v
             */
            setRotatable(v);

            /**
             * 设置旋转步进
             * @param {Number} v
             */
            setRotateStep(v);

            /**
             * 设置图元是否可编辑旋转过滤器
             * @param {Function} func
             */
            setRotationEditableFunc(func);

            /**
             * 设置拓扑是否共享选中模型
             * @param {Boolean} v
             */
            setSelectionModelShared(v);

            /**
             * 设置大小编辑过滤器
             * @param {Function} func
             */
            setSizeEditableFunc(func);

            /**
             * 设置摄像头正上方向，该参数一般较少改动，默认值为[0, 1, 0]
             * @param {Array} up 格式：[x, y, z]
             */
            setUp(up);

            /**
             * 设置可见过滤器
             * @param {Function} func 过滤器函数
             */
            setVisibleFunc(func);

            /**
             * 设置是否可进退
             * @param {Boolean} walkable
             */
            setWalkable(walkable);

            /**
             * 设置布局宽度
             * @param {Number} width
             */
            setWidth(width);

            /**
             * 缩放操作，默认操作模式意味着eye离center的远近变化，如果在Graph3dView#isOrtho()为true的正交投影情况下，缩放意味着改变Graph3dView#setOrthoWidth(width)的可视宽度范围。
             * @param {Number} increment 步进的比例，调用zoomIn(anim)和zoomOut(anim)，等同于调用了setZoom(1.3, anim)和setZoom(1/1.3, anim)。
             * @param {Boolean} anim 是否使用动画
             */
            setZoom(increment, anim);

            /**
             * 设置是否可缩放
             * @param {Boolean} v
             */
            setZoomable(v);

            /**
             * 获取选中模型，{@link ht.graph3d.Graph3dView#getSelectionModel getSelectionModel}的缩写
             * @see {@link ht.graph3d.Graph3dView#getSelectionModel getSelectionModel}
             * @return {ht.SelectionModel}
             */
            sm();

            /**
             * 将拓扑导出为canvas
             * @param {color} background 背景色
             * @return {HTMLCanvasElement}
             */
            toCanvas(background);

            /**
             * 将拓扑导出为base64格式字符串
             * @param {color} background 背景色
             * @return {String}
             */
            toDataURL(background);

            /**
             * 删除交互事件监听器，{@link ht.graph3d.Graph3dView#removeInteractorListener removeInteractorListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph3d.Graph3dView#removeInteractorListener removeInteractorListener}
             */
            umi(listener, scope);

            /**
             * 删除自身属性变化事件监听器，{@link ht.graph3d.Graph3dView#removePropertyChangeListener removePropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.graph3d.Graph3dView#removePropertyChangeListener removePropertyChangeListener}
             */
            ump(listener, scope);

            /**
             * 立刻刷新拓扑
             */
            validate();

            /**
             * 同时改变eye和center的位置，也就是eye和center在两点建立的矢量方向上同时移动相同的偏移量。
             * 如果为第一人称模式调用walk操作，该函数会考虑Graph3dView#getBoundaries()边界限制
             * @param {Number} step 偏移的矢量长度值
             * @param {Boolean} anim 是否使用动画
             * @param {Boolean} firstPersonMode  是否是第一人称模式，为空时则采用Graph3dView#isFirstPersonMode()
             */
            walk(step, anim, firstPersonMode);

            /**
             * 相当于调用setZoom(1.3, anim)
             * @param {Boolean} [anim] 是否使用动画
             * @see {@link ht.graph3d.Graph3dView#setZoom setZoom}
             */
            zoomIn(anim);

            /**
             * 相当于调用setZoom(1/1.3, anim)
             * @param {Boolean} [anim] 是否使用动画
             * @see {@link ht.graph3d.Graph3dView#setZoom setZoom}
             */
            zoomOut(anim);
        }

        /**
         * 拓扑组件上交互器基类，封装了交互的基础功能
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @constructor
         */
        export class Interactor {
            constructor(gv: ht.graph.GraphView);
        }


        /**
         * 实现GraphView手抓图、Group双击展开合并、进出SubGraph、EdgeGroup展开合并等基本交互功能
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @constructor
         * @extends {ht.graph.Interactor}
         */
        export class DefaultInteractor extends Interactor {
            constructor(graphView);
        }






        /**
         * 实现拖拽移动图元的交互功能
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @constructor
         * @extends {ht.graph.Interactor}
         */
        export class MoveInteractor extends Interactor {
            constructor(graphView: ht.graph.GraphView);
        }

        /**
         * 实现单击选择和拖拽框选功能
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @constructor
         * @extends {ht.graph.Interactor}
         */
        export class SelectInteractor extends Interactor {
            constructor(graphView: ht.graph.GraphView);
        }

        /**
         * 实现对图元的大小、旋转以及多边形编辑功能
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @constructor
         * @extends {ht.graph.Interactor}
         */
        export class EditInteractor extends Interactor {
            constructor(graphView);
        }
        /**
         * 实现触摸屏上Touch交互
         * @param {ht.graph.GraphView} graphView 绑定拓扑组件
         * @param {Object} params 交互参数
         * @constructor
         * @extends {ht.graph.Interactor}
         * @example //params参数格式：
         * {
     * 	selectable: true|false,//是否启用选择功能
     * 	movable: true|false,//是否启用移动功能
     * 	pannable: true|false,//是否启用pan功能
     * 	pinchable: true|false,//是否启用双指pinch缩放
     * 	editable: true|false,//是否启用编辑功能
     * }
         *
         */
        export class TouchInteractor extends Interactor {
            constructor(graphView: ht.graph.GraphView, params: any);
        }
    }
    namespace Default {
        /**
         * 指定组件基准CSS的ZIndex值，改值仅在将HT与其他第三方组件混合使用时根据需要设置"
         * @type Number
         */
        var baseZIndex: any;

        /**
         * 判断是否为触屏可Touch方式交互，HT系统一般会自动判断，对于极少数HT无法正确识别的系统下，可以通过配置强制指定
         * @type boolean
         */
        var isTouchable: any;

        /**
         * 设备像素比，HT系统自动取至window.devicePixelRatio，某些特性情况需要为mobile应用牺牲精度节省内存时可以强制设置为较小值
         * @type Number
         */
        var devicePixelRatio: any;

        /**
         * 组件初次加载时界面宽高值可能会为0，HT会自动尝试等待下次延迟刷新，该参数指定尝试次数，一般无需改动
         * @default 3
         * @type Number
         */
        var reinvalidateCount: any;

        /**
         * 进行框选判断时为了避免内存占用过大，HT会根据最大面积限制进行缩放判断，该参数一般无需改动
         * @default 3000
         * @type Number
         */
        var hitMaxArea: any;

        /**
         * 决定Data元素被选中时，组件是否自动滚动到Data元素可见位置
         * @default true
         * @type boolean
         */
        var autoMakeVisible: any;

        /**
         * 决定组件的滚动条默认是否自动隐藏，true为自动显示和隐藏，false则需要滚动时一直显示不会自动隐藏
         * @default true
         * @type boolean
         */
        var autoHideScrollBar: any;

        /**
         * 组件无效时的透明度
         * @type Number
         */
        var disabledOpacity: any;

        /**
         * 组件无效时的背景色
         * @type color
         */
        var disabledBackground: any;

        /**
         * 组件的ToolTip显示的延迟间隔
         * @default 800
         * @type Number
         */
        var toolTipDelay: any;

        /**
         * 组件的ToolTip显示的情况下，如果鼠标移动到新的位置时，ToolTip是否实时持续跟进
         * @default false
         * @type boolean
         */
        var toolTipContinual: any;

        /**
         * 线条末端线帽的样式，可选值为butt|round|square
         * @default butt
         * @type String
         */
        var lineCap: any;

        /**
         * 当两条线交汇时创建边角的类型，可选参数为：bevel|round|miter
         * @default round
         * @type String
         */
        var lineJoin: any;

        /**
         * 默认图片的渐进色类型
         * @default linear.northeast
         * @type String
         */
        var imageGradient: any;

        /**
         * 连线或多边形等图形的默认虚线样式
         * @type Array
         */
        var dashPattern: any;

        /**
         * 默认动画效果函数
         * @default function (m){return m*m}
         * @type Function
         */
        var animEasing: any;

        /**
         * 默认文字颜色
         * @default #000
         * @type color
         */
        var labelColor: any;

        /**
         * 选中状态下文字颜色
         * @default #fff
         * @type color
         */
        var labelSelectColor: any;

        /**
         * 默认文字字体
         * @default 12px arial, sans-serif
         * @type font
         */
        var labelFont: any;

        /**
         * 默认文字字体
         * @default 12px arial, sans-serif
         * @type font
         */
        var labelFont: any;

        /**
         * 通用组件缩进，例如树组件每一层的缩进
         * @default 20
         * @type Number
         */
        var widgetIndent: any;

        /**
         * 通用组件行高，例如表格每行行高
         * @default 20
         * @type Number
         */
        var widgetRowHeight: any;

        /**
         * 通用组件抬头高度，例如TabView，TableHeader和Toolbar等的头部高度
         * @default 22
         * @type Number
         */
        var widgetHeaderHeight: any;

        /**
         * AccordionView和TabView等组件的Title默认高度
         * @default 24
         * @type Number
         */
        var widgetTitleHeight: any;

        /**
         * 滚动条默认颜色
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var scrollBarColor: any;

        /**
         * 滚动条默认宽度
         * @default 7
         * @type Number
         */
        var scrollBarSize: any;

        /**
         * 滚动条默认的隐藏间隔毫秒数
         * @default 1000
         * @type Number
         */
        var scrollBarTimeout: any;

        /**
         * 滚动条默认最小长度
         * @default 20
         * @type Number
         */
        var scrollBarMinLength: any;

        /**
         * 滚动条起作用区域默认大小
         * @default 16
         * @type Number
         */
        var scrollBarInteractiveSize: any;

        /**
         * 默认缩放步进
         * @default 1.3
         * @type Number
         */
        var zoomIncrement: any;

        /**
         * 默认滚轮缩放步进
         * @default 1.05
         * @type Number
         */
        var scrollZoomIncrement: any;

        /**
         * 默认双指触屏Touch方式缩放步进
         * @default 1.08
         * @type Number
         */
        var pinchZoomIncrement: any;

        /**
         * 默认最大缩放倍数
         * @default 20
         * @type Number
         */
        var zoomMax: any;

        /**
         * 默认最小缩放倍数
         * @default 0.01
         * @type Number
         */
        var zoomMin: any;

        /**
         * 默认曲线分段微分数
         * @default 12
         * @type Number
         */
        var segmentResolution: any;

        /**
         * 默认模型分段微分数
         * @default 24
         * @type Number
         */
        var shapeResolution: any;

        /**
         * 默认模型边数
         * @default 24
         * @type Number
         */
        var shapeSide: any;

        /**
         * ToolTip的文字颜色
         * @default #000
         * @type color
         */
        var toolTipLabelColor: any;

        /**
         * ToolTip的文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var toolTipLabelFont: any;

        /**
         * ToolTip的文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var toolTipLabelFont: any;

        /**
         * ToolTip的背景颜色
         * @default #FFFFE0
         * @type color
         */
        var toolTipBackground: any;

        /**
         * ToolTip的阴影颜色
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var toolTipShadowColor: any;

        /**
         * 矢量组件comp嵌套堆栈，矢量组件comp可嵌套定义，通过改参数能得到当前嵌套层次信息
         * @type Array
         */
        var compStack: any;

        /**
         * 此函数返回连线组的代理连线，edges为ht.List类型的ht.Edge对象数组，默认返回edges.get(0)，可重载自定义规则
         * @type Function
         */
        var edgeGroupAgentFunc: any;

        /**
         * GraphView组件中拖动图元到边缘时会自动滚动，该参数决定开始自动滚动的区域范围，设置为0或负数则代表关闭自动滚动功能
         * @default 16
         * @type Number
         */
        var graphViewAutoScrollZone: any;

        /**
         * 决定GraphView组件按空格键是否允许复位，复位调用了GraphView#reset()函数，该函数默认会调用setZoom(1)和setTranslate(0, 0)
         * @default true
         * @type Boolean
         */
        var graphViewResettable: any;

        /**
         * 决定GraphView组件是否允许手抓图操作
         * @default true
         * @type Boolean
         */
        var graphViewPannable: any;

        /**
         * 决定GraphView组件是否允许按Ctrl键进行框选操作
         * @default true
         * @type Boolean
         */
        var graphViewRectSelectable: any;

        /**
         * 决定GraphView组件是否显示滚动条
         * @default true
         * @type Boolean
         */
        var graphViewScrollBarVisible: any;

        /**
         * GraphView组件框选边框颜色
         * @default #2C3E50
         * @type color
         */
        var graphViewRectSelectBorderColor: any;

        /**
         * GraphView组件框选背景颜色
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var graphViewRectSelectBackground: any;

        /**
         * GraphView组件编辑点大小
         * @default 7
         * @type Number
         */
        var graphViewEditPointSize: any;

        /**
         * GraphView组件编辑点边框颜色
         * @default #2C3E50
         * @type color
         */
        var graphViewEditPointBorderColor: any;

        /**
         * GraphView组件编辑点背景颜色
         * @default #D9D9D9
         * @type color
         */
        var graphViewEditPointBackground: any;

        /**
         * Graph3dView组件初始化WebGL上下文参数，一般无需改动
         * @default null
         * @type Object
         */
        var graph3dViewAttributes: any;

        /**
         * Graph3dView组件是否为第一人称交互方式
         * @default false
         * @type Boolean
         */
        var graph3dViewFirstPersonMode: any;

        /**
         * Graph3dView组件在第一人称交互方式时，鼠标是否能漫游
         * @default true
         * @type Boolean
         */
        var graph3dViewMouseRoamable: any;

        /**
         * Graph3dView组件键盘控制移动的步进
         * @default 15
         * @type Number
         */
        var graph3dViewMoveStep: any;

        /**
         * Graph3dView组件键盘控制旋转的步进
         * @default 0.05235987755982988
         * @type Number
         */
        var graph3dViewRotateStep: any;

        /**
         * Graph3dView组件是否允许按Shift键进行手抓图平移
         * @default true
         * @type Boolean
         */
        var graph3dViewPannable: any;

        /**
         * Graph3dView组件是否允许进行旋转中心或方位操作
         * @default true
         * @type Boolean
         */
        var graph3dViewRotatable: any;

        /**
         * Graph3dView组件是否允许前进后退操作
         * @default true
         * @type Boolean
         */
        var graph3dViewWalkable: any;

        /**
         * Graph3dView组件是否允许按空格键复位，复位调用了Graph3dView#reset()函数，该函数会重置Graph3dView的eye|center|up三个参数
         * @default true
         * @type Boolean
         */
        var graph3dViewResettable: any;

        /**
         * Graph3dView组件是否允许缩放
         * @default true
         * @type Boolean
         */
        var graph3dViewZoomable: any;

        /**
         * Graph3dView组件是否允许框选
         * @default true
         * @type Boolean
         */
        var graph3dViewRectSelectable: any;

        /**
         * Graph3dView组件框选背景
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var graph3dViewRectSelectBackground: any;

        /**
         * Graph3dView组件是否允许显示xz面网格
         * @default false
         * @type Boolean
         */
        var graph3dViewGridVisible: any;

        /**
         * Graph3dView组件显示xz面的网格行列数
         * @default 50
         * @type Number
         */
        var graph3dViewGridSize: any;

        /**
         * Graph3dView组件显示xz面的网格行列间距
         * @default 50
         * @type Number
         */
        var graph3dViewGridGap: any;

        /**
         * Graph3dView组件显示xz面的网格线颜色
         * @default [0.4,0.75,0.85,1]
         * @type color
         */
        var graph3dViewGridColor: any;

        /**
         * Graph3dView组件原点x|y|z三个轴线是否可见
         * @default false
         * @type Boolean
         */
        var graph3dViewOriginAxisVisible: any;

        /**
         * Graph3dView组件屏幕中心点x|y|z三个轴线是否可见
         * @default false
         * @type Boolean
         */
        var graph3dViewCenterAxisVisible: any;

        /**
         * Graph3dView组件显示x轴线颜色
         * @default [1,0,0,1]
         * @type color
         */
        var graph3dViewAxisXColor: any;

        /**
         * Graph3dView组件显示y轴线颜色
         * @default [0,1,0,1]
         * @type color
         */
        var graph3dViewAxisYColor: any;

        /**
         * Graph3dView组件显示z轴线颜色
         * @default [0,0,1,1]
         * @type color
         */
        var graph3dViewAxisZColor: any;

        /**
         * Graph3dView组件在编辑状态图元拉伸标识颜色
         * @default [1,1,0,1]
         * @type color
         */
        var graph3dViewEditSizeColor: any;

        /**
         * Graph3dView组件是否显示为正交投影方式
         * @default false
         * @type Boolean
         */
        var graph3dViewOrtho: any;

        /**
         * Graph3dView组件正交投影方式下屏幕宽度内显示的逻辑宽度值
         * @default 2000
         * @type Number
         */
        var graph3dViewOrthoWidth: any;

        /**
         * Graph3dView组件在透视投影方式下的y轴张角弧度（Field of view）
         * @default 0.7853981633974483
         * @type Number
         */
        var graph3dViewFovy: any;

        /**
         * Graph3dView组件投影呈现内容的最近距离，该值在可接受的范围内尽量设置较大值有利于呈现精度
         * @default 10
         * @type Number
         */
        var graph3dViewNear: any;

        /**
         * Graph3dView组件投影呈现内容的最远距离，该值可根据场景最远范围进行调节设置
         * @default 10000
         * @type Number
         */
        var graph3dViewFar: any;

        /**
         * Graph3dView组件投影呈现时，眼睛观察点所在位置
         * @default [0,300,1000]
         * @type Array
         */
        var graph3dViewEye: any;

        /**
         * Graph3dView组件投影呈现时，眼睛最终锁定的目标中心位置
         * @default [0,0,0]
         * @type Array
         */
        var graph3dViewCenter: any;

        /**
         * Graph3dView组件投影呈现时，摄像镜头垂直朝上方向
         * @default [0,1,-1e-7]
         * @type Array
         */
        var graph3dViewUp: any;

        /**
         * 头灯影响范围，默认为`0`代表可照射到无穷远处，如果设置了值则光照射效果随物体远离光影而衰减
         * @default 0
         * @type Number
         */
        var graph3dViewHeadlightRange: any;

        /**
         * 头灯影响范围，默认为`0`代表可照射到无穷远处，如果设置了值则光照射效果随物体远离光影而衰减
         * @default 0
         * @type Number
         */
        var graph3dViewHeadlightRange: any;

        /**
         * 头灯颜色
         * @default [1,1,1,1]
         * @type Array
         */
        var graph3dViewHeadlightColor: any;

        /**
         * 头灯强度，默认为1，大于1增强，小于1减弱
         * @default 1
         * @type Number
         */
        var graph3dViewHeadlightIntensity: any;

        /**
         * 是否关闭头灯效果
         * @default false
         * @type Boolean
         */
        var graph3dViewHeadlightDisabled: any;

        /**
         * 是否关闭雾化效果
         * @default true
         * @type Boolean
         */
        var graph3dViewFogDisabled: any;

        /**
         * 雾颜色
         * @default white
         * @type color
         */
        var graph3dViewFogColor: any;

        /**
         * 代表从该距离起物体开始受雾效果影响
         * @default 1
         * @type Number
         */
        var graph3dViewFogNear: any;

        /**
         * 代表从该距离之后物体完全看不清
         * @default 2000
         * @type Number
         */
        var graph3dViewFogFar: any;

        /**
         * 折叠组件展开状态图标
         * @type String
         */
        var accordionViewExpandIcon: any;

        /**
         * 折叠组件关闭状态图标
         * @type String
         */
        var accordionViewCollapseIcon: any;

        /**
         * 折叠组件文字颜色
         * @default #FFF
         * @type color
         */
        var accordionViewLabelColor: any;

        /**
         * 折叠组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var accordionViewLabelFont: any;

        /**
         * 折叠组件抬头背景
         * @default #2C3E50
         * @type color
         */
        var accordionViewTitleBackground: any;

        /**
         * 折叠组件选中背景
         * @default #1ABC9C
         * @type color
         */
        var accordionViewSelectBackground: any;

        /**
         * 折叠组件选中宽度
         * @default 3
         * @type Number
         */
        var accordionViewSelectWidth: any;

        /**
         * 折叠组件分隔条颜色
         * @type color
         */
        var accordionViewSeparatorColor: any;

        /**
         * 分割组件分隔条宽度
         * @default 1
         * @type Number
         */
        var splitViewDividerSize: any;

        /**
         * 分割组件分隔条背景
         * @default #2C3E50
         * @type color
         */
        var splitViewDividerBackground: any;

        /**
         * 分割组件分隔条拖拽过程透明度
         * @default 0.5
         * @type Number
         */
        var splitViewDragOpacity: any;

        /**
         * 分割组件展开合并图标
         * @type String
         */
        var splitViewToggleIcon: any;

        /**
         * 属性组件文字颜色
         * @default #000
         * @type color
         */
        var propertyViewLabelColor: any;

        /**
         * 属性组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var propertyViewLabelSelectColor: any;

        /**
         * 属性组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var propertyViewLabelFont: any;

        /**
         * 属性组件展开图标
         * @type String
         */
        var propertyViewExpandIcon: any;

        /**
         * 属性组件合并图标
         * @type String
         */
        var propertyViewCollapseIcon: any;

        /**
         * 属性组件背景
         * @default #ECF0F1
         * @type color
         */
        var propertyViewBackground: any;

        /**
         * 属性组件行线是否可见
         * @default true
         * @type Boolean
         */
        var propertyViewRowLineVisible: any;

        /**
         * 属性组件列线是否可见
         * @default true
         * @type Boolean
         */
        var propertyViewColumnLineVisible: any;

        /**
         * 属性组件行线颜色
         * @default #D9D9D9
         * @type color
         */
        var propertyViewRowLineColor: any;

        /**
         * 属性组件列线颜色
         * @default #D9D9D9
         * @type color
         */
        var propertyViewColumnLineColor: any;

        /**
         * 属性组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var propertyViewSelectBackground: any;

        /**
         * 列表组件文字颜色
         * @default #000
         * @type color
         */
        var listViewLabelColor: any;

        /**
         * 列表组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var listViewLabelSelectColor: any;

        /**
         * 列表组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var listViewLabelFont: any;

        /**
         * 列表组件行线是否可见
         * @default false
         * @type Boolean
         */
        var listViewRowLineVisible: any;

        /**
         * 列表组件行线颜色
         * @default #D9D9D9
         * @type color
         */
        var listViewRowLineColor: any;

        /**
         * 列表组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var listViewSelectBackground: any;

        /**
         * 树组件文字颜色
         * @default #000
         * @type color
         */
        var treeViewLabelColor: any;

        /**
         * 树组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var treeViewLabelSelectColor: any;

        /**
         * 树组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var treeViewLabelFont: any;

        /**
         * 树组件展开状态图标
         * @type String
         */
        var treeViewExpandIcon: any;

        /**
         * 树组件关闭状态图标
         * @type String
         */
        var treeViewCollapseIcon: any;

        /**
         * 树组件行线是否可见
         * @default false
         * @type Boolean
         */
        var treeViewRowLineVisible: any;

        /**
         * 树组件行线颜色
         * @default #D9D9D9
         * @type color
         */
        var treeViewRowLineColor: any;

        /**
         * 树组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var treeViewSelectBackground: any;

        /**
         * 表格组件文字颜色
         * @default #000
         * @type color
         */
        var tableViewLabelColor: any;

        /**
         * 表格组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var tableViewLabelSelectColor: any;

        /**
         * 表格组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var tableViewLabelFont: any;

        /**
         * 表格组件行线是否可见
         * @default true
         * @type Boolean
         */
        var tableViewRowLineVisible: any;

        /**
         * 表格组件列线是否可见
         * @default true
         * @type Boolean
         */
        var tableViewColumnLineVisible: any;

        /**
         * 表格组件行线颜色
         * @default #D9D9D9
         * @type color
         */
        var tableViewRowLineColor: any;

        /**
         * 表格组件列线颜色
         * @default #D9D9D9
         * @type color
         */
        var tableViewColumnLineColor: any;

        /**
         * 表格组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var tableViewSelectBackground: any;

        /**
         * 树表组件文字颜色
         * @default #000
         * @type color
         */
        var treeTableViewLabelColor: any;

        /**
         * 树表组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var treeTableViewLabelSelectColor: any;

        /**
         * 树表组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var treeTableViewLabelFont: any;

        /**
         * 树表格组件展开状态图标
         * @type String
         */
        var treeTableViewExpandIcon: any;

        /**
         * 树表格组件关闭状态图标
         * @type String
         */
        var treeTableViewCollapseIcon: any;

        /**
         * 树表格组件行线是否可见
         * @default true
         * @type Boolean
         */
        var treeTableViewRowLineVisible: any;

        /**
         * 树表格组件列线是否可见
         * @default true
         * @type Boolean
         */
        var treeTableViewColumnLineVisible: any;

        /**
         * 树表格组件行线颜色
         * @default #D9D9D9
         * @type color
         */
        var treeTableViewRowLineColor: any;

        /**
         * 树表格组件列线颜色
         * @default #D9D9D9
         * @type color
         */
        var treeTableViewColumnLineColor: any;

        /**
         * 树表组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var treeTableViewSelectBackground: any;

        /**
         * 表头组件文字颜色
         * @default #000
         * @type color
         */
        var tableHeaderLabelColor: any;

        /**
         * 表头组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var tableHeaderLabelFont: any;

        /**
         * 表头组件列线是否可见
         * @default true
         * @type Boolean
         */
        var tableHeaderColumnLineVisible: any;

        /**
         * 表头组件列线颜色
         * @default #D9D9D9
         * @type color
         */
        var tableHeaderColumnLineColor: any;

        /**
         * 表头组件背景
         * @default #ECF0F1
         * @type color
         */
        var tableHeaderBackground: any;

        /**
         * 表头组件移动状态背景
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var tableHeaderMoveBackground: any;

        /**
         * 表头组件插入状态颜色
         * @default #1ABC9C
         * @type color
         */
        var tableHeaderInsertColor: any;

        /**
         * 表头组件降序图标
         * @type String
         */
        var tableHeaderSortDescIcon: any;

        /**
         * 表头组件升序图标
         * @type String
         */
        var tableHeaderSortAscIcon: any;

        /**
         * 页签组件间距
         * @default 1
         * @type Number
         */
        var tabViewTabGap: any;

        /**
         * 页签组件文字颜色
         * @default #FFF
         * @type color
         */
        var tabViewLabelColor: any;

        /**
         * 页签组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var tabViewLabelFont: any;

        /**
         * 页签组件背景
         * @default #2C3E50
         * @type color
         */
        var tabViewTabBackground: any;

        /**
         * 页签组件选中宽度
         * @default 3
         * @type Number
         */
        var tabViewSelectWidth: any;

        /**
         * 页签组件选中背景
         * @default #1ABC9C
         * @type color
         */
        var tabViewSelectBackground: any;

        /**
         * 页签组件移动状态背景
         * @default rgba(0,0,0,0.35)
         * @type color
         */
        var tabViewMoveBackground: any;

        /**
         * 页签组件插入状态颜色
         * @default #1ABC9C
         * @type color
         */
        var tabViewInsertColor: any;

        /**
         * 工具条组件文字颜色
         * @default #000
         * @type color
         */
        var toolbarLabelColor: any;

        /**
         * 工具条组件文字选中颜色
         * @default #FFF
         * @type color
         */
        var toolbarLabelSelectColor: any;

        /**
         * 工具条组件文字字体
         * @default 12px arial, sans-serif
         * @type String
         */
        var toolbarLabelFont: any;

        /**
         * 工具条组件背景
         * @default #ECF0F1
         * @type color
         */
        var toolbarBackground: any;

        /**
         * 工具条组件选中背景色
         * @default #1ABC9C
         * @type color
         */
        var toolbarSelectBackground: any;

        /**
         * 工具条组件Item的间距
         * @default 8
         * @type Number
         */
        var toolbarItemGap: any;

        /**
         * 工具条组件的分隔条颜色
         * @default #868686
         * @type color
         */
        var toolbarSeparatorColor: any;


        /**
         * 数字类型监听器，该监听器将使得input文本输入框只允许输入数学相关字符
         * @type Function
         * @example
         * numberListener: (function(){
     *      var map = {
     *          46: 1,
     *          8: 1,
     *          9: 1,
     *          27: 1,
     *          13: 1,
     *          109: 1,
     *          110: 1,
     *          189: 1,
     *          190: 1
     *      };
     *      return function(e){
     *          var keyCode = e.keyCode;
     *          if(map[keyCode] || (keyCode === 65 && Default.isCtrlDown(e)) || (keyCode >= 35 && keyCode <= 39)){
     *              return;
     *          }
     *          if ((e.shiftKey || (keyCode < 48 || keyCode > 57)) && (keyCode < 96 || keyCode > 105)) {
     *              e.preventDefault();
     *          }
     *      };
     *  })()
         */
        var numberListener: any;

        /**
         * 无法加载图片资源时会调用该函数，默认访问空，可自定义返回一个默认的图片
         * @type Function
         * @example
         * var handleImageLoaded = function(name, url) {
     *
     * }
         */
        var handleUnfoundImage: any;

        /**
         * 图片在加载之后的回调函数
         * @type Function
         * @example
         * var handleImageLoaded = function(name, img) {
     *
     * }
         */
        var handleImageLoaded: any;

        var sortFunc: any;

        /**
         * 获得HT的版本号
         * @return {String} 版本号
         */
        function getVersion();

        /**
         * 注册矢量组件类型
         * @param {String} type 类型名称
         * @param {Function} func 绘制函数，例：function(g, rect, comp, data, view)();
         */
        function setCompType(type, func);

        /**
         * 获得注册的矢量组件类型
         * @param {String} type 类型名称
         */
        function getCompType(type);

        /**
         * 阻止事件的默认行为，常用于屏蔽触屏上默认DoubleTap缩放等行为
         * @param {Event} e 事件对象
         */
        function preventDefault(e);

        /**
         * 获取当前窗口left|top|width|height的参数信息
         *
         * 返回的对象格式如下：
         * @example {
     * 	left: 0,
     * 	top: 0,
     * 	width: 1280
     * 	height: 768
     * }
         */
        function getWindowInfo();

        /**
         * 判断目前是否处于拖拽状态
         * @return {boolean} 是否处于拖拽状态
         */
        function isDragging(): boolean;

        /**
         * 判断是否鼠标左键被按下
         * @param {Event} e 事件对象
         * @return {boolean} 鼠标左键是否被按下
         */
        function isLeftButton(e);

        /**
         * 获取当前Touch手指个数
         * @param {Event} e 事件对象
         * @return {Number} Touch手指个数
         */
        function getTouchCount(e);

        /**
         * 判断是否为双击事件
         * @param {Event} e 事件对象
         * @return {boolean} 是否是双击
         */
        function isDoubleClick(e);

        /**
         * 判断Shift键是否被按下
         * @param {Event} e 事件对象
         * @return {boolean} Shift键是否被按下
         */
        function isShiftDown(e);

        /**
         * 判断Ctrl键是否被按下
         * @param {Event} e 事件对象
         * @return {boolean} Ctrl键是否被按下
         */
        function isCtrlDown(e);

        /**
         * 返回client属性坐标
         * @param {Event} e 事件对象
         * @return {Object} client坐标对象
         * @example //返回值示例:
         * {
     *    x: 100,
     *    y: 100
     * }
         */
        function getClientPoint(e);

        /**
         * 返回page属性坐标
         * @param {Event} e 事件对象
         * @return {Object} page坐标对象
         * @example //返回值示例:
         * {
     *    x: 100,
     *    y: 100
     * }
         */
        function getPagePoint(e);

        /**
         * 注册图片
         * @param {String} name 图片名
         * @param {Number} [width] 图片宽度
         * @param {Number} [height] 图片高度
         * @param {HTMLImageElement|HTMLCanvasElement|String|Object} img img、canvas对象或图片url或base64字符串或矢量对象
         */
        function setImage(name, width, height, img);

        /**
         * 获得已注册的图片
         * @param {String} name 图片名
         * @param {color} [color] 染色
         * @return {HTMLImageElement|HTMLCanvasElement|Object} 返回已经注册的图片
         */
        function getImage(name, color);

        /**
         * 获取全局下一个id编号
         * @return {Number} id
         */
        function getId(): number;

        /**
         * 获取全局下一个id编号
         * @param {Function} func 回调函数
         * @param {Object} scope 函数域
         * @param {Array} args 函数参数列表
         * @param {Number} delay 延迟时间(毫秒)
         */
        function callLater(func, scope, args, delay);

        /**
         * 传入一个对象参数，以浅拷贝的方式返回一个新的复制对象
         * @param {Object} obj 要复制的对象
         * @return {Object} 新复制的对象
         */
        function clone(obj);

        /**
         * 返回所有HT预定义类的json结构信息，key为类全路径名，value为类声明(构造函数)
         * @return {Object} 类结构信息
         */
        function getClassMap();

        /**
         * 传入全路径类字符串名称，返回类定义(构造函数)
         * @param {String} name 类名
         * @return {Function} 类定义(构造函数)
         */
        function getClass(name);

        /**
         * 定义类
         * @param {String|Object} className 类名，如果为字符串，自动注册到HT的classMap中，一般使用函数(构造函数)即可
         * @param {Object} superClass 要继承的父类
         * @param {Object} methods 方法和变量声明
         * @example
         * function MyData() {
     * 	MyData.superClass.constructor.call(this);
     * }
         * function def(MyData, ht.Data, {
     * 	sayHello: function() {
     * 		console.log('hello');
     * 	}
     * });
         */
        function def(className, superClass, methods);

        /**
         * 启动动画
         * @param {Object} paramObj 动画配置对象，请参考入门手册中的动画属性
         * @example
         * function startAnim({
     * 	frames: 60,
     * 	interval: 16,
     * 	finishFunc: function() {
     * 		console.log('finish');
     * 	},
     * 	action: function(t) {
     * 		console.log(t);
     * 	}
     * });
         */
        function startAnim(paramObj);

        /**
         * 计算文字的尺寸
         * @param {String} font 文字字体，如:12px Arial
         * @param {String} text 文字内容
         * @return {Object} 文字尺寸
         * @example //返回值示例:
         * {
     * 	width: 100,
     * 	height: 100
     * }
         *
         */
        function getTextSize(font, text);

        /**
         * 绘制文字
         * @param {CanvasRenderingContext2D} g 画笔对象
         * @param {String} value 文字内容
         * @param {String} font 文字字体
         * @param {color} color 文字颜色
         * @param {Number} x 绘制开始的x坐标
         * @param {Number} y 绘制开始的y坐标
         * @param {Number} width 绘制的宽度
         * @param {Number} height 绘制的高度
         * @param {String} align 文字水平对齐方式，可选值为left|center|right
         * @param {String} vAlign 文字垂直对齐方式，可选值为top|middle|bottom
         * @example function drawText(g, 'Hello, HT', '12px Arial', 0, 0, 200, 100, 'center', 'middle');
         */
        function drawText(g, value, font, color, x, y, width, height, align, vAlign);

        /**
         * 获取两点之间距离，或向量长度
         * @param {Object|Array} p1 第一个点的坐标(格式：{x: x, y: y})或第一个向量(格式：[x, y, z])
         * @param {Object|Array} p2 第二个点的坐标(格式：{x: x, y: y})或第二个向量(格式：[x, y, z])
         * @return {Number} 距离
         * @example //二维两点距离
         * var distance getDistance({x: 0, y: 0}, {x: 10, y: 0});// distance equals 10
         * //三维两点距离
         * var distance3d getDistance([0, 0, 0], [0, 10, 0]);// distance3d equals 10
         */
        function getDistance(p1, p2);

        /**
         * 返回比color更亮的颜色
         * @param {color} color 原始颜色
         * @param {Number} factor 变化因子，默认为40，允许值0~100
         * @example
         * var newColor brighter('#f00');
         * @return {color} 新的颜色
         */
        function brighter(color, factor);

        /**
         * 返回比color更暗的颜色
         * @param {color} color 原始颜色
         * @param {Number} factor 变化因子，默认为40，允许值0~100
         * @return {color} 新的颜色
         * @example
         * var newColor darker('#f00');
         */
        function darker(color, factor);

        /**
         * 将点组合成矩形
         * @param {Object} p1 第一个点或点数组
         * @param {Object} p2 第二个点
         * @return {Object} 组合的矩形
         * @example //组合两点：
         * var rect unionPoint({x: 0, y: 0}, {x: 100, y: 100});
         * //rect结果：
         * {
     * 	x: 0,
     * 	y: 0,
     * 	width: 100,
     * 	height: 100
     * }
         * 组合多点：
         * var rect unionPoint([{x: 0, y: 0}, {x: 50, y: 50}, {x: 100, y: 100}]);
         * //rect结果：
         * {
     * 	x: 0,
     * 	y: 0,
     * 	width: 100,
     * 	height: 100
     * }
         */
        function unionPoint(p1, p2);

        /**
         * 将两个矩形区域union融合成新的矩形区域
         * @param {Object} rect1 第一个矩形区域
         * @param {Object} rect2 第二个矩形区域
         * @return {Object} 新的矩形区域
         * @example var rect unionRect(
         * {x: 0, y: 0, width: 100, height: 100},
         * {x: 0, y: 0, width: 200, height: 200});
         * //rect结果：
         * {
     * 	x: 0,
     * 	y: 0,
     * 	width: 200,
     * 	height: 200
     * }
         */
        function unionRect(rect1, rect2);

        /**
         * 判断point是否包含在rect的矩形区域里
         * @param {Object} rect 矩形
         * @param {Object} point 点
         * @return {Boolean} 矩形是否包含点
         * @example function containsPoint({x: 0, y: 0, width: 100, height: 100}, {x: 50, y: 50})//true
         */
        function containsPoint(rect, point);

        /**
         * 判断矩形区域rect1是否包含矩形区域rect2
         * @param {Object} rect1 矩形1
         * @param {Object} rect2 矩形2
         * @return {Boolean} 矩形1是否包含矩形2
         * @example function containsRect({x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 10, height: 10})//true
         */
        function containsRect(rect1, rect2);

        /**
         * 判断矩形区域rect1和矩形区域rect2是否相交
         * @param {Object} rect1 矩形1
         * @param {Object} rect2 矩形2
         * @return {Boolean} 两个矩形是否相交
         * @example function intersectsRect({x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 200, height: 200})//true
         */
        function intersectsRect(rect1, rect2);

        /**
         * 获得两个矩形的相交区域
         * @param {Object} rect1 矩形1
         * @param {Object} rect2 矩形2
         * @return {Object} 相交的矩形区域，如果没有相交，返回null
         * @example var rect intersection({x: 0, y: 0, width: 100, height: 100}, {x: 50, y: 50, width: 200, height: 200})
         * //rect结果：
         * {
     * 	x: 50,
     * 	y: 50,
     * 	width: 50,
     * 	height: 50
     * }
         */
        function intersection(rect1, rect2);

        /**
         * 改变rect大小，上下左右分别扩展extend的大小
         * @param {Object} rect 原始矩形
         * @param {Number} extend 扩展大小
         * @example var rect = {x: 0, y: 0, width: 100, height: 100};
         * function grow(rect, 2)
         * //rect结果：
         * {
     * 	x: -2,
     * 	y: -2,
     * 	width: 104,
     * 	height: 104
     * }
         */
        function grow(rect, extend);

        /**
         * 获取交互点的逻辑坐标，使用视图对象上的此方法更为便捷
         * @param {Event} e 事件对象
         * @param {Object} view 视图对象
         * @param {Number} translateX 水平偏移
         * @param {Number} translateY 垂直偏移
         * @param {Number} zoomX 水平缩放
         * @param {Number} zoomY 垂直缩放
         * @return {Object} 逻辑点坐标
         */
        function getLogicalPoint(e, view, translateX, translateY, zoomX, zoomY);

        /**
         * 删除指定的DOM对象
         * @param {Element} domElement DOM对象
         * @return {Boolean} 操作是否成功
         */
        function removeHTML(domElement);

        /**
         * 返回ToolTip的相应div对象，可获取进行风格自定义
         * @return {Element} ToolTip相应的div对象
         */
        function getToolTipDiv();

        /**
         * 判断ToolTip是否正在显示状态
         * @return {Boolean} ToolTip是否显示
         */
        function isToolTipShowing();

        /**
         * 隐藏正在显示的ToolTip
         */
        function hideToolTip();

        /**
         * 显示ToolTip
         * @param {Event|Object} eventOrPoint 鼠标事件对象或点坐标
         * @param {String} innerHTML ToolTip的内容
         */
        function showToolTip(eventOrPoint, innerHTML);

        /**
         * 启动拖拽，自定义交互时可能用到
         * @param {Object} interactor 交互器
         * @param {Event} e 事件对象
         */
        function startDragging(interactor, e);

        /**
         * 获得所有注册图片的信息对象
         * @return {Object} 已注册图片的映射表
         */
        function getImageMap();

        /**
         * 将不连续曲线转化成Graph3dView#setBoundaries(bs)需要的参数格式
         * @param {Array} points 曲线上的点坐标数组
         * @param {Array} segmets 曲线上的线段类型数组
         * @param {Number} resolution 曲线微分数
         * @return {Array} 适合Graph3dView#setBoundaries(bs)需要的参数格式
         */
        function toBoundaries(points, segments, resolution);

        /**
         * 返回当前键盘按键信息，key为键的keyCode，如果按下则值为true
         * @return {Object} 键盘按键信息
         */
        function getCurrentKeyCodeMap();

        /**
         * 以x,y为中心绘制img图片
         * @param {CanvasRenderingContext2D} g 画笔对象
         * @param {HTMLImageElement|HTMLCanvasElement|Object} img 要绘制的图片(img对象、canvas对象或矢量对象)
         * @param {Number} x 中心点x坐标
         * @param {Number} y 中心点y坐标
         * @param {ht.Data} data 要绑定的Data对象
         * @param {Object} view 要绑定的视图对象
         * @param {color} color 染色
         */
        function drawCenterImage(g, img, x, y, data, view, color);

        /**
         * 在矩形位置内绘制图片
         * @param {CanvasRenderingContext2D} g 画笔对象
         * @param {HTMLImageElement|HTMLCanvasElement|Object} img 要绘制的图片(img对象、canvas对象或矢量对象)
         * @param {String} stretch 拉伸类型(uniform/centerUniform/fill)
         * @param {Number} x 矩形左上角x坐标
         * @param {Number} y 矩形左上角y坐标
         * @param {Number} w 矩形宽度
         * @param {Number} h 矩形高度
         * @param {ht.Data} data 要绑定的Data对象
         * @param {Object} view 要绑定的视图对象
         * @param {color} color 染色
         */
        function drawStretchImage(g, img, stretch, x, y, w, h, data, view, color);

        /**
         * 将图片转换成Canvas对象
         * @param {HTMLImageElement|Object} image 要转换的图片(img对象或矢量对象)
         * @param {Number} width 新canvas的宽度
         * @param {Number} height 新canvas的高度
         * @param {String} stretch 拉伸类型(uniform/centerUniform/fill)
         * @param {ht.Data} data 要绑定的Data对象
         * @param {Object} view 要绑定的视图对象
         * @param {color} color 染色
         * @return {HTMLCanvasElement} canvas对象
         */
        function toCanvas(image, width, height, stretch, data, view, color);

        /**
         * 创建DOM对象
         * @param {String} tagName DOM类型(如div、a、span等)
         * @param {String} borderColor 边框颜色
         * @param {String} font 字体
         * @param {String} value 内容
         * @return {Element} DOM对象
         */
        function createElement(tagName, borderColor, font, value);

        /**
         * 判断交互事件所处位置是否在View组件之上，一般用于Drog And Drop的拖拽操作判断
         * @param {Event} event 事件对象
         * @param {Object} view 视图对象
         * @return {Boolean}
         */
        function containedInView(event, view);

        /**
         * 判断目前系统是否处于隔离状态，处于隔离状态时host吸附和Group组等图元间的联动关系将会被停止
         * @return {Boolean} 是否处于隔离状态
         */
        function isIsolating();

        /**
         * 设置系统的隔离状态，处于隔离状态时host吸附和Group组等图元间的联动关系将会被停止
         * @param {Boolean} isolating 新的状态
         */
        function setIsolating(isolating);

        /**
         * 将颜色转换为rgba格式
         * @param {color} color 旧格式的颜色
         * @return {Array} rgba格式的颜色
         */
        function toColorData(color);

        /**
         * 绘制图片
         * @param {CanvasRenderingContext2D} g 画笔对象
         * @param {HTMLImageElement|HTMLCanvasElement|Object} image 要绘制的图片(img对象、canvas对象或矢量对象)
         * @param {Number} x 绘制范围左上角x坐标
         * @param {Number} y 绘制范围左上角y坐标
         * @param {Number} width 绘制范围宽度
         * @param {Number} height 绘制范围高度
         * @param {ht.Data} data 要绑定的Data对象
         * @param {Object} view 要绑定的视图对象
         * @param {color} blendColor 染色
         */
        function drawImage(g, image, x, y, width, height, data, view, blendColor);

        /**
         * 返回当前矢量组件comp，即function compStack[0]，一般用于矢量值绑定func动态调用时使用
         * @return {Object} 矢量组件comp
         */
        function getCurrentComp();

        /**
         * 返回当前矢量组件上一层comp，即function compStack[1]，一般用于矢量值绑定func动态调用时使用
         * @return {Object} 矢量组件comp
         */
        function getParentComp();

        /**
         * 注册连线类型
         * @param {String} type 连线类型名
         * @param {Function} func 决定连线走向的函数
         * @example function setEdgeType('customEdge', function(edge, gap, graphView) {
     *          return {
     *          	points: points;
     *          	segments: segments;
     *          }
     * })
         */
        function setEdgeType(type, func);

        /**
         * 获取连线类型函数
         * @param {String} type 连线类型名
         * @return {Function} 连线类型函数
         */
        function getEdgeType(type);

        /**
         * 注册3D模型，请参考modeling建模手册
         * @param {String} name 模型名
         * @param {Object} model 模型内容
         */
        function setShape3dModel(name, model);

        /**
         * 返回所注册的3D模型
         * @param {String} name 模型名
         * @return {Object} 模型
         */
        function getShape3dModel(name);

        /**
         * 将一组JSON描述的缩放、移动和旋转等操作转换成对应的变化矩阵
         */
        function createMatrix(array, matrix);

        /**
         * 将指定矢量或顶点，通过矩阵转换运算出变化后的新矢量或顶点位置
         */
        function transformVec(vec, matrix);

        /**
         * 构建六面体模型，该模型的六个面显示的颜色和贴图都将一样
         */
        function createBoxModel();

        /**
         * 构建圆角矩形体模型
         */
        function createRoundRectModel(top, bottom);

        /**
         * 构建星形体模型
         */
        function createStarModel(top, bottom);

        /**
         * 构建矩形体模型
         */
        function createRectModel(top, bottom);

        /**
         * 构建三角形体模型
         */
        function createTriangleModel(top, bottom);

        /**
         * 构建直角三角形体模型
         */
        function createRightTriangleModel(top, bottom);

        /**
         * 构建平行四边形体模型
         */
        function createParallelogramModel(top, bottom);

        /**
         * 构建梯形体模型
         */
        function createTrapezoidModel(top, bottom);

        /**
         * 构建光滑球体模型
         */
        function createSmoothSphereModel(hResolution, vResolution, hStart, hArc, vStart, vArc, radius);

        /**
         * 构建球体模型
         */
        function createSphereModel(side, sideFrom, sideTo, from, to, resolution);

        /**
         * 构建光滑圆锥体模型
         */
        function createSmoothConeModel(bottom, resolution, start, arc, radius);

        /**
         * 构建圆锥体模型
         */
        function createConeModel(side, sideFrom, sideTo, from, to, bottom);

        /**
         * 构建光滑圆柱体模型
         */
        function createSmoothCylinderModel(resolution, top, bottom, topRadius, bottomRadius, start, arc, height);

        /**
         * 构建圆柱体模型
         */
        function createCylinderModel(side, sideFrom, sideTo, from, to, top, bottom);

        /**
         * 构建光滑圆环体模型
         */
        function createSmoothTorusModel(radius, tubeRadius, hResolution, vResolution, start, arc);

        /**
         * 构建圆环体模型
         */
        function createTorusModel(side, sideFrom, sideTo, from, to, radius, resolution);

        /**
         * 根据xz平面多边形，挤压形成3D模型
         */
        function createExtrusionModel(array, segments, top, bottom, resolution, repeatUVLength, tall, elevation);

        /**
         * 根据xy平面的曲线，环绕一周形成光滑3D模型
         */
        function createSmoothRingModel(array, segments, vResolution, start, arc, hResolution);

        /**
         * 根据xy平面的曲线，环绕一周形成3D模型
         */
        function createRingModel(array, segments, resolution, top, bottom, side, sideFrom, sideTo, from, to);

        /**
         * 注册3d图元的批量信息，用于优化大数据量图元绘制性能，详细用法请参考批量手册
         * @param {String} name 批量名
         * @param {Object} batchInfo 批量信息
         */
        function setBatchInfo(name, batchInfo);

        /**
         * 获取已注册的批量信息
         * @param {String} name 批量名
         * @return {Oject} 批量信息
         */
        function getBatchInfo(name);
    }
    namespace widget {
        /**
         * 树形组件，以树形的方式呈现DataModel中Data数据的父子关系
         * @param {ht.DataModel} dataModel 绑定的数据模型
         * @constructor
         */
        export class TreeView {
            constructor(dataModel: ht.DataModel);
            /**
             * 增加底层Painter<br>
             * 组件上提供Painter接口，开发者可以使用Canvas的画笔对象自由绘制任意形状，底层Painter绘制在组件最下面
             * @param {Function} painter Painter类
             * @example //Painter示例：
             * function MyBottomPainter() {
       * }
             * ht.Default.def(MyBottomPainter, Object, {
       * 	draw: function(g) {
       * 		g.save();
       * 		//draw...
       * 		g.restore();
       * 	}
       * });
             * treeView.addBottomPainter(MyBottomPainter);
             */
            addBottomPainter(painter);

            /**
             * 增加自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.widget.TreeView#mp mp}
             */
            addPropertyChangeListener(listener, scope, ahead);


            /**
             * 增加顶层Painter<br>
             * 组件上提供Painter接口，开发者可以使用Canvas的画笔对象自由绘制任意形状，顶层Painter绘制在组件最上面
             * @param {Function} painter Painter类
             * @example //Painter示例：
             * function MyTopPainter() {
       * }
             * ht.Default.def(MyTopPainter, Object, {
       * 	draw: function(g) {
       * 		g.save();
       * 		//draw...
       * 		g.restore();
       * 	}
       * });
             * treeView.addTopPainter(MyTopPainter);
             */
            addTopPainter(painter);


            /**
             * 监听视图事件，如布局、刷新等
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             */
            addViewListener(listener, scope, ahead);

            /**
             * 合并data对象
             * @param {ht.Data} data 数据元素
             */
            collapse(data);

            /**
             * 合并所有对象
             */
            collapseAll();

            /**
             * 关闭ToolTip功能
             */
            disableToolTip();

            /**
             * 获取或设置数据模型，没有参数时相当于{@link ht.widget.TreeView#getDataModel getDataModel}，有参数时相当于{@link ht.widget.TreeView#setDataModel setDataModel}
             * @param {ht.DataModel} [dataModel] 数据模型
             * @return {ht.DataModel} dataModel
             */
            dm(dataModel);

            /**
             * 绘制图标，可重载自定义
             * @param {CanvasRenderingContext2D} g 画笔对象
             * @param {ht.Data} data 数据元素
             * @param {Number} x 左上角x坐标
             * @param {Number} y 左上角y坐标
             * @param {Number} width 绘制的宽度
             * @param {Number} height 绘制的高度
             */
            drawIcon(g, data, x, y, width, height);

            /**
             * 绘制文本，可重载自定义，label一般绘制在最后因此没有width参数限制
             * @param {CanvasRenderingContext2D} g 画笔对象
             * @param {ht.Data} data 数据元素
             * @param {Number} x 左上角x坐标
             * @param {Number} y 左上角y坐标
             * @param {Number} height 绘制的高度
             */
            drawLabel(g, data, x, y, height);

            /**
             * 绘制行内容，可重载自定义，默认调用drawIcon和drawLabel，如果返回值为HTML元素，则使用HTML元素当作Renderer
             * @param {CanvasRenderingContext2D} g 画笔对象
             * @param {ht.Data} data 数据元素
             * @param {Boolean} selected 数据元素是否选中
             * @param {Number} x 左上角x坐标
             * @param {Number} y 左上角y坐标
             * @param {Number} width 绘制的宽度
             * @param {Number} height 绘制的高度
             * @return {HTMLElement}
             */
            drawRow(g, data, selected, x, y, width, height);

            /**
             * 绘制行背景色，默认仅在选中该行时填充选中背景色，可重载自定义
             * @param {CanvasRenderingContext2D} g 画笔对象
             * @param {ht.Data} data 数据元素
             * @param {Boolean} selected 数据元素是否选中
             * @param {Number} x 左上角x坐标
             * @param {Number} y 左上角y坐标
             * @param {Number} width 绘制的宽度
             * @param {Number} height 绘制的高度
             */
            drawRowBackground(g, data, selected, x, y, width, height);

            /**
             * 启用ToolTip
             */
            enableToolTip();

            /**
             * 展开data对象
             * @param {ht.Data} data 数据元素
             */
            expand(data);

            /**
             * 展开所有对象
             */
            expandAll();

            /**
             * 获取数据元素icon的背景色，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {color} 颜色值，默认返回data.s('body.color')
             */
            getBodyColor(data);

            /**
             * 获取数据元素icon的边框色，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {color} 颜色值，默认返回data.s('border.color')
             */
            getBorderColor(data);

            /**
             * 返回数据元素对应的check图标，可重载自定义check图标，该函数在checkMode模式下有效
             * @param {ht.Data} data 数据元素
             * @return {String}
             */
            getCheckIcon(data);

            /**
             * 获取check模式
             * <ul>
             * <li>null：默认值，不启用check选择模式</li>
             * <li>default：check模式的默认选择方式，即单击选中或取消选中，只影响当前点击中的data对象</li>
             * <li>children：该check模式将同时影响点击中的data对象，以及其孩子对象</li>
             * <li>descendant：该check模式将同时影响点击中的data对象，以及其所有子孙对象</li>
             * <li>all：该check模式将同时影响点击中的data对象，以及其所有父辈和子孙对象</li>
             * </ul>
             * @return {String}
             */
            getCheckMode();

            /**
             * 获取toggle的关闭图标
             * @return {String}
             */
            getCollapseIcon();

            /**
             * 传入逻辑坐标点或者交互event事件参数，返回当前点下的数据元素
             * @param {Object|Event} pointOrEvent 逻辑坐标点或交互事件对象(如鼠标事件对象)
             * @return {ht.Data} 点下的数据元素
             */
            getDataAt(pointOrEvent);

            /**
             * 获取绑定的数据模型
             * @return {ht.DataModel} 数据模型
             */
            getDataModel();

            /**
             * 获取当前可见区域的结束行索引
             * @return {Number}
             */
            getEndRowIndex();

            /**
             * 获取toggle的展开图标
             * @return {String}
             */
            getExpandIcon();

            /**
             * 在checkMode模式下数据除了被选中有check状态外，还可以有被点击行的focus状态<br>
             * 此方法获取focus数据元素
             * @return {ht.Data}
             */
            getFocusData();

            /**
             * 获取布局高度
             * @return {Number}
             */
            getHeight();

            /**
             * 获取data对象对应的icon图标，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {String}
             */
            getIcon(data);

            /**
             * 返回data对象对应的图标宽度，默认如果有图标则以indent值为宽度，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {Number}
             */
            getIconWidth(data);

            /**
             * 获取indent缩进，该值一般当作图标的宽度
             * @param {ht.Data} data 数据元素
             * @return {Number}
             */
            getIndent(data);

            /**
             * 获取data对象显示的文字，默认返回data.toLabel()，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {String}
             */
            getLabel(data);

            /**
             * 获取data对象的文本颜色，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {color}
             */
            getLabelColor(data);

            /**
             * 获取data对象的文本字体，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {String}
             */
            getLabelFont(data);

            /**
             * 获取选中文本的颜色
             * @return {color}
             */
            getLabelSelectColor();

            /**
             * 获取当前data的缩减层次，一般结合indent参数用于绘制
             * @param {ht.Data} data 数据元素
             * @return {Number}
             */
            getLevel(data);

            /**
             * 获取延迟加载器
             * @return {Object}
             */
            getLoader();

            /**
             * 传入HTML事件对象，将事件坐标转换为组件中的逻辑坐标
             * @param {Event} event 事件对象
             * @return {Object}
             * @see {@link ht.widget.TreeView#lp lp}
             */
            getLogicalPoint(event);

            /**
             * 获取根节点，默认为空，从DataModel#getRoots()的对象开始展示
             * @return {ht.Data}
             */
            getRootData();

            /**
             * 获取当前显示的Data对象集合，该集合已被排序和过滤
             * @return {ht.List}
             */
            getRowDatas();

            /**
             * 获取行高
             * @return {Number}
             */
            getRowHeight();

            /**
             * 获取data对象所在的行索引
             * @param {ht.Data} data 数据元素
             * @return {Number}
             */
            getRowIndex(data);

            /**
             * 获取行线颜色
             * @return {color}
             */
            getRowLineColor();

            /**
             * 返回当前可见行总行数
             * @return {Number}
             */
            getRowSize();

            /**
             * 获取滚动条颜色
             * @return {color}
             */
            getScrollBarColor();

            /**
             * 获取滚动条宽度
             * @return {Number}
             */
            getScrollBarSize();

            /**
             * 获取选择过滤器函数
             * @return {Function}
             */
            getSelectableFunc();

            /**
             * 获取行选中背景颜色
             * @return {color}
             */
            getSelectBackground();

            /**
             * 获取选中模型
             * @return {ht.SelectionModel}
             * @see {@link ht.widget.TreeView#sm sm}
             */
            getSelectionModel();

            /**
             * 获取排序函数
             * @return {Function}
             */
            getSortFunc();

            /**
             * 获取当前可见区域的起始行索引
             * @return {Number}
             */
            getStartRowIndex();

            /**
             * 返回当前data对象对应的展开或合并图标，可重载自定义
             * @param {ht.Data} data 数据元素
             * @return {String}
             */
            getToggleIcon(data);

            /**
             * 获取ToolTip文字，可重载返回自定义的toolTip文字
             * @param {Event} e 鼠标或Touch事件对象
             * @return {String} toolTip文字，默认取出鼠标下的图元，然后返回其getToolTip()
             */
            getToolTip(e);

            /**
             * 获取垂直平移值
             * @return {Number} 垂直平移值
             * @see {@link ht.widget.TreeView#ty ty}
             */
            getTranslateY();

            /**
             * 获取组件的根层div
             * @return {HTMLDivElement}
             */
            getView();

            /**
             * 获取组件中可见区域的逻辑尺寸
             * @return {Object}
             */
            getViewRect();

            /**
             * 获取可见过滤器函数
             * @return {Function}
             */
            getVisibleFunc();

            /**
             * 获取布局宽度
             * @return {Number}
             */
            getWidth();

            /**
             * 无效组件，并调用延时刷新
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.widget.TreeView#iv iv}
             */
            invalidate(delay);

            /**
             * 无效数据元素
             * @param {ht.Data} data 要无效的数据元素
             */
            invalidateData(data);

            /**
             * 无效模型，最彻底的刷新方式
             * @see {@link ht.widget.TreeView#ivm ivm}
             */
            invalidateModel();

            /**
             * 是否自动隐藏滚动条
             * @return {Boolean}
             */
            isAutoHideScrollBar();

            /**
             * 选中数据元素时，是否自动平移组件以确保该元素出现在可见区域内
             * @return {Boolean}
             */
            isAutoMakeVisible();

            /**
             * 是否是check模式
             * @return {Boolean}
             */
            isCheckMode();

            /**
             * 判断是否允许对parent对象的孩子排序，默认返回true，可重载屏蔽孩子排序
             * @param {ht.Data} parent 父元素
             * @return {Boolean}
             */
            isChildrenSortable(parent);

            /**
             * 组件是否处于不可用状态，处于此状态时不能进行任何操作并且会遮挡一层蒙板
             * @return {Boolean}
             */
            isDisabled();

            /**
             * 判断data对象是否展开
             * @param {ht.Data} data 数据元素
             * @return {Boolean}
             */
            isExpanded(data);

            /**
             * 判断rootData节点是否可见
             * @return {Boolean}
             */
            isRootVisible();

            /**
             * 获取行线是否可见，默认为true
             * @return {Boolean}
             */
            isRowLineVisible();

            /**
             * 判断data对象是否可被选中
             * @param {ht.Data} data 数据元素
             * @return {Boolean}
             */
            isSelectable(data);

            /**
             * 判断data对象是否被选中
             * @param {ht.Data} data 图元
             * @return {Boolean}
             */
            isSelected(data);

            /**
             * 根据id判断data对象是否被选中
             * @param {String|Number} id 数据元素id
             * @return {Boolean}
             */
            isSelectedById(id);

            /**
             * 当前组件是否共享选中模型
             * @return {Boolean}
             */
            isSelectionModelShared();

            /**
             * 判断数据元素是否可见
             * @param {ht.Data} data 数据元素
             * @return {Boolean}
             */
            isVisible(data);

            /**
             * 无效组件，并调用延时刷新，{@link ht.widget.TreeView#invalidate invalidate}的缩写
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.widget.TreeView#invalidate invalidate}
             */
            iv(delay);

            /**
             * 无效模型，重新构造内部的rows数据，最彻底的刷新方式，{@link ht.widget.TreeView#invalidateModel invalidateModel}的缩写
             * @see {@link ht.widget.TreeView#invalidateModel invalidateModel}
             */
            ivm();

            /**
             * 传入HTML事件对象，将事件坐标转换为组件中的逻辑坐标，{@link ht.widget.TreeView#getLogicalPoint getLogicalPoint}的缩写
             * @param {Event} event 事件对象
             * @return {Object}
             * @see {@link ht.widget.TreeView#getLogicalPoint getLogicalPoint}
             */
            lp(event);

            /**
             * 平移组件以确保数据元素在可见区域内
             * @param {ht.Data} data 数据元素
             */
            makeVisible(data);

            /**
             * 增加自身属性变化事件监听器，{@link ht.widget.TreeView#addPropertyChangeListener addPropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.widget.TreeView#addPropertyChangeListener addPropertyChangeListener}
             */
            mp(listener, scope, ahead);

            /**
             * 合并data对象时调用，可重载做后续处理
             * @param {ht.Data} data 数据元素
             */
            onCollapsed(data);

            /**
             * 数据元素被点击时回调，可重载做后续处理
             * @param {ht.Data} data 被点击的数据元素
             * @param {Event} e 事件对象
             */
            onDataClicked(data, e);

            /**
             * 数据元素被双击时回调，可重载做后续处理
             * @param {ht.Data} data 双击的数据元素
             * @param {Event} e 事件对象
             */
            onDataDoubleClicked(data, e);

            /**
             * 展开data对象时调用，可重载做后续处理
             * @param {ht.Data} data 数据元素
             */
            onExpanded(data);

            /**
             * 平移动画结束时回调，可重载做后续处理
             */
            onTranslateEnded();

            /**
             * 重绘组件中所有行，仅次于invalidateModel的彻底刷新方式
             */
            redraw();

            /**
             * 删除底层Painter
             * @param {Object} painter Painter类
             */
            removeBottomPainter(painter);

            /**
             * 删除自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removePropertyChangeListener(listener, scope);

            /**
             * 删除所有选中的图元
             */
            removeSelection();

            /**
             * 删除顶层Painter
             * @param {Object} painter Painter类
             */
            removeTopPainter(painter);

            /**
             * 删除视图事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removeViewListener(listener, scope);

            /**
             * 平移(滚动)组件至指定的行号
             * @param {Number} index 行号
             */
            scrollToIndex(index);

            /**
             * 选中所有数据元素
             */
            selectAll();

            /**
             * 设置是否自动隐藏滚动条
             * @param {Boolean} v
             */
            setAutoHideScrollBar(v);

            /**
             * 设置当选中数据元素，是否自动平移(滚动)组件以确保该数据元素出现在可见区域内
             * @param {Boolean} v
             */
            setAutoMakeVisible(v);

            /**
             * 设置check模式
             * @param {String} v
             * <ul>
             * <li>null：默认值，不启用check选择模式</li>
             * <li>default：check模式的默认选择方式，即单击选中或取消选中，只影响当前点击中的data对象</li>
             * <li>children：该check模式将同时影响点击中的data对象，以及其孩子对象</li>
             * <li>descendant：该check模式将同时影响点击中的data对象，以及其所有子孙对象</li>
             * <li>all：该check模式将同时影响点击中的data对象，以及其所有父辈和子孙对象</li>
             * </ul>
             */
            setCheckMode(v);

            /**
             * 设置toggle的关闭图标
             * @param {String} v icon
             */
            setCollapseIcon(v);

            /**
             * 设置绑定的数据模型
             * @param {ht.DataModel} dataModel 数据模型
             */
            setDataModel(dataModel);

            /**
             * 设置组件是否处于不可用状态，处于不可用状态时不能进行任何操作并且会遮挡一层蒙板
             * @param {Boolean} value 是否禁用组件
             * @param {String} [iconUrl] 蒙板上显示的icon的路径
             */
            setDisabled(value, iconUrl);

            /**
             * 设置toggle的展开图标
             * @param {String} v icon
             */
            setExpandIcon(v);

            /**
             * 在checkMode模式下数据除了被选中有check状态外，还可以有被点击行的focus状态<br>
             * 此方法设置focus的数据元素
             * @param {ht.Data} data 数据元素
             */
            setFocusData(data);

            /**
             * 在checkMode模式下数据除了被选中有check状态外，还可以有被点击行的focus状态<br>
             * 此方法设置focus的数据元素
             * @param {String|Number} id 数据元素的id
             */
            setFocusDataById(id);

            /**
             * 设置布局高度
             * @param {Number} v 高度值
             */
            setHeight(v);

            /**
             * 设置indent缩进，该值一般当作图标的宽度
             * @param {Number} v
             */
            setIndent(v);

            /**
             * 设置行label文字颜色
             * @param {color} v
             */
            setLabelColor(v);

            /**
             * 设置行label文字字体
             * @param {String} v
             */
            setLabelFont(v);

            /**
             * 设置行label文字选中颜色
             * @param {color} v
             */
            setLabelSelectColor(v);

            /**
             * 设置延迟加载器
             * @param {Object} v
             * @example //示例：
             * treeView.setLoader({
       * 	load: function(data) {
       * 		//展开此data时回调，可用于加载子节点
       * 	},
       * 	isLoaded: function(data) {
       * 		//返回此data的子结点是否已加载
       * 	}
       * });
             *
             */
            setLoader(v);

            /**
             * 指定根节点，默认为空，从DataModel#getRoots()的对象开始展示
             * @param {ht.Data} v
             */
            setRootData(v);

            /**
             * 设置根节点是否可见
             * @param {Boolean} v
             */
            setRootVisible(v);

            /**
             * 设置行高
             * @param {Number} v
             */
            setRowHeight(v);

            /**
             * 设置行线颜色
             * @param {color} color
             */
            setRowLineColor(color);

            /**
             * 设置行线是否可见
             * @param {Boolean} v
             */
            setRowLineVisible(v);

            /**
             * 设置滚动条颜色
             * @param {color} color 颜色值
             */
            setScrollBarColor(color);

            /**
             * 设置滚动条宽度
             * @param {Number} size 宽度值
             */
            setScrollBarSize(size);

            /**
             * 设置选择过滤器函数
             * @param {Function} func 过滤器函数
             */
            setSelectableFunc(func);

            /**
             * 设置行选中背景颜色
             * @param {color} color
             */
            setSelectBackground(color);

            /**
             * 设置组件是否共享选中模型
             * @param {Boolean} v
             */
            setSelectionModelShared(v);

            /**
             * 设置排序函数
             * @param {Function} func
             */
            setSortFunc(func);

            /**
             * 设置垂直平移值(水平平移值无效)
             * @param {Number} x 水平平移值，此参数无效
             * @param {Number} y 垂直平移值
             * @param {Boolean} anim 是否使用动画
             */
            setTranslate(x, y, anim);

            /**
             * 设置垂直平移值
             * @param {Number} v 垂直平移值
             */
            setTranslateY(v);

            /**
             * 设置可见过滤器
             * @param {Function} func 过滤器函数
             */
            setVisibleFunc(func);

            /**
             * 设置布局宽度
             * @param {Number} v 宽度值
             */
            setWidth(v);

            /**
             * 显示垂直滚动条
             */
            showVBar();

            /**
             * 获取选中模型，{@link ht.widget.TreeView#getSelectionModel getSelectionModel}的缩写
             * @see {@link ht.widget.TreeView#getSelectionModel getSelectionModel}
             * @return {ht.SelectionModel}
             */
            sm();

            /**
             * 展开或合并data对象
             * @param {ht.Data} data 数据元素
             */
            toggle(data);

            /**
             * 在当前值基础上增加垂直平移值(水平无效)
             * @param {Number} x 新增的水平平移值，此参数无效
             * @param {Number} y 新增的垂直平移值
             * @param {Boolean} [anim] 是否使用动画
             */
            translate(x, y, anim);

            /**
             * 获取或设置垂直平移值，没有参数时相当于{@link ht.widget.TreeView#getTranslateY getTranslateY}，有参数时相当于{@link ht.widget.TreeView#setTranslateY setTranslateY}
             * @param {Number} value 平移值
             */
            ty(value);

            /**
             * 删除自身属性变化事件监听器，{@link ht.widget.TreeView#removePropertyChangeListener removePropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.widget.TreeView#removePropertyChangeListener removePropertyChangeListener}
             */
            ump(listener, scope);

            /**
             * 立刻刷新组件
             */
            validate();
        }

        /**
         * 分割组件，用于左右或上下分割两个组件
         * @param {Object|HTMLElement} leftView 左侧或顶部组件
         * @param {Object|HTMLElement} rightView 右侧或底部组件
         * @param {Boolean} orientation 布局方式，v上下布局，h左右布局
         * @param {Number} position 分割条位置，0-1之间表示百分比，大于1表示绝对尺寸，正数指定左侧或顶部组件的尺寸，负数指定右侧或底部组件的尺寸
         * @constructor
         */
        export class SplitView {
            constructor(leftView, rightView, orientation, position);

            /**
             * 增加自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.widget.SplitView#mp mp}
             */
            addPropertyChangeListener(listener, scope, ahead);

            /**
             * 监听视图事件，如布局、刷新等
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             */
            addViewListener(listener, scope, ahead);

            /**
             * 获取分割条背景色
             * @return {color}
             */
            getDividerBackground();

            /**
             * 获取分割条DIV
             * @return {HTMLDivElement}
             */
            getDividerDiv();

            /**
             * 获取分割条宽度
             * @return {Number}
             */
            getDividerSize();

            /**
             * 获取分割条拖拽时的透明度，默认为0.5
             * @return {Number}
             */
            getDragOpacity();

            /**
             * 获取布局高度
             * @return {Number}
             */
            getHeight();

            /**
             * 获取左侧组件
             * @return {Object|HTMLElement}
             */
            getLeftView();

            /**
             * 获取布局方式，v上下布局，h左右布局
             * @return {String}
             */
            getOrientation();

            /**
             * 获取分割条位置，0-1之间表示百分比，大于1表示绝对尺寸，正数指定左侧或顶部组件的尺寸，负数指定右侧或底部组件的尺寸
             * @return {Number}
             */
            getPosition();

            /**
             * 获取右侧组件
             * @return {Object|HTMLElement}
             */
            getRightView();

            /**
             * 获取toggle状态
             * @return {String}
             * <ul>
             * <li>normal代表中间分割状态</li>
             * <li>cl代表collapse left关闭左侧或顶部组件</li>
             * <li>cr代表collapse right关闭右侧或底部组件</li>
             * </ul>
             */
            getStatus();

            /**
             * 获取分割条上的toggle图标
             * @return {String}
             */
            getToggleIcon();

            /**
             * 获取组件的根层div
             * @return {HTMLDivElement}
             */
            getView();

            /**
             * 获取布局宽度
             * @return {Number}
             */
            getWidth();

            /**
             * 无效组件，并调用延时刷新
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.widget.SplitView#iv iv}
             */
            invalidate(delay);

            /**
             * 组件是否处于不可用状态，处于此状态时不能进行任何操作并且会遮挡一层蒙板
             * @return {Boolean}
             */
            isDisabled();

            /**
             * 获取是否允许拖拽分割条，默认为true
             * @return {Boolean}
             */
            isDraggable();

            /**
             * 获取分割点是否可通过点击直接展开和关闭，默认为true
             * @return {Boolean}
             */
            isTogglable();

            /**
             * 无效组件，并调用延时刷新，{@link ht.widget.SplitView#invalidate invalidate}的缩写
             * @param {Number} delay 延迟刷新的间隔事件(单位:ms)
             * @see {@link ht.widget.SplitView#invalidate invalidate}
             */
            iv(delay);

            /**
             * 增加自身属性变化事件监听器，{@link ht.widget.SplitView#addPropertyChangeListener addPropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @param {Boolean} [ahead] 是否将当前监听器插入到监听器列表开头
             * @see {@link ht.widget.SplitView#addPropertyChangeListener addPropertyChangeListener}
             */
            mp(listener, scope, ahead);

            /**
             * 删除自身属性变化事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removePropertyChangeListener(listener, scope);

            /**
             * 删除视图事件监听器
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             */
            removeViewListener(listener, scope);

            /**
             * 设置组件是否处于不可用状态，处于不可用状态时不能进行任何操作并且会遮挡一层蒙板
             * @param {Boolean} value 是否禁用组件
             * @param {String} [iconUrl] 蒙板上显示的icon的路径
             */
            setDisabled(value, iconUrl);

            /**
             * 设置分割条背景色
             * @param {color} background
             */
            setDividerBackground(background);

            /**
             * 设置分割条宽度
             * @param {Number} size
             */
            setDividerSize(size);

            /**
             * 设置是否允许拖拽分割条，默认为true
             * @param {Boolean} draggable
             */
            setDraggable(draggable);

            /**
             * 设置分割条拖拽时的透明度，默认为0.5
             * @param {Number} opacity
             */
            setDragOpacity(opacity);

            /**
             * 设置布局高度
             * @param {Number} height
             */
            setHeight(height);

            /**
             * 设置左侧组件
             * @param {Object|HTMLElement} left
             */
            setLeftView(left);

            /**
             * 设置布局方式，v上下布局，h左右布局
             * @param {String} orientation
             */
            setOrientation(orientation);

            /**
             * 设置分割条位置，0-1之间表示百分比，大于1表示绝对尺寸，正数指定左侧或顶部组件的尺寸，负数指定右侧或底部组件的尺寸
             * @param {Number} position
             */
            setPosition(position);

            /**
             * 设置右侧组件
             * @param {Object|HTMLElement} right
             */
            setRightView(right);

            /**
             * 设置toggle状态
             * @param {String} status
             * <ul>
             * <li>normal代表中间分割状态</li>
             * <li>cl代表collapse left关闭左侧或顶部组件</li>
             * <li>cr代表collapse right关闭右侧或底部组件</li>
             * </ul>
             */
            setStatus(status);

            /**
             * 设置分割点是否可通过点击直接展开和关闭，默认为true
             * @param {Boolean} togglable
             */
            setTogglable(togglable);

            /**
             * 设置分割条上的toggle图标
             * @param {String} icon
             */
            setToggleIcon(icon);

            /**
             * 设置布局宽度
             * @param {Number} width
             */
            setWidth(width);

            /**
             * 删除自身属性变化事件监听器，{@link ht.widget.SplitView#removePropertyChangeListener removePropertyChangeListener}的缩写
             * @param {Function} listener 监听器函数
             * @param {Object} [scope] 监听器函数域
             * @see {@link ht.widget.SplitView#removePropertyChangeListener removePropertyChangeListener}
             */
            ump(listener, scope);

            /**
             * 立刻刷新组件
             */
            validate();
        }
        export class TableView {

        }
    }
}

declare module 'highTopo' {
    export = ht;
}
