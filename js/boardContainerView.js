/**
 * Created by hua on 15/11/18.
 */
var circleLabelRadius = 21;//圆形标签半径

var currentLabel;// 当前选定的标签,html元素

var picId;

//画布
var Container = Backbone.View.extend({
    id: 'commentCanvas',
    tagName: 'div',
    className: 'commentCanvas',

    events: {
        'click': 'onBgImgClick',
        'click .commentLabelView': 'onLabelClick',//点击标签
        'click .borderDiv': 'onBorderClick',//点击标签
        'mouseover .commentLabelView': 'mouseHoverLabel',
    },

    initialize: function () {
        this.borderView = new BorderView();//包括外边框的评论列表容器
        this.hasRendered = false;
        this.collection.each(this.addCircleLabel, this);
        this.listenTo(this.collection, 'add', this.addCircleLabel);
        this.listenTo(this.collection, 'remove', this.removeCircleLabel);
    },

    /**
     * 添加圆形标签
     * @param labelModel
     */
    addCircleLabel: function (labelModel) {

        //1、创建labelView
        var label = new CommentLabelView();

        //2、记录当前label
        currentLabel = label.el;

        //3、样式设置以及添加到画布中
        var $_el = label.render().$el;
        $_el.attr('id', labelModel.get('id'));
        $_el.css('top', labelModel.get('posY') - circleLabelRadius).css('left', labelModel.get('posX') - circleLabelRadius);
        this.$el.append($_el);

        //saveAllComments();
    },

    removeCircleLabel: function (labelModel) {
        this.$("#" + labelModel.get('id')).remove();
    },

    /**
     * 初始化评论列表视图
     * 创建标签
     * @param e
     */
    onBgImgClick: function (e) {
        if (this.borderView != undefined && this.borderView.$el.is(":visible") == true) {
            this.borderView.$el.hide();

            var model = labelCollection.findWhere({'id': currentLabel.id});
            if (model.get('comments') === "" || model.get('comments') === "[]") {
                this.collection.remove(model);
            }

            return false;
        }

        if (e == undefined) {
            return;
        }

        var posX = e.offsetX-20,
            posY = e.clientY-10;
        var labelModel = new LabelModel({
            'id': guid(),
            'posX': posX,
            'posY': posY,
        });
        this.collection.push(labelModel);

        this.borderView.showCommentsListView(posX, posY);
    },

    /**
     * 阻止点击事件传递给父View
     * @returns {boolean}
     */
    onLabelClick: function () {
        if (this.borderView != undefined && this.borderView.$el.is(":visible") == true) {
            this.borderView.$el.hide();
        } else {
            this.borderView.$el.show();

        }
        return false;
    },

    onBorderClick: function () {
        return false;
    },

    /**
     * 鼠标经过圆形标签，则展示评论列表
     */
    mouseHoverLabel: function (e) {
        if (e == undefined || (currentLabel == e.target && this.borderView.$el.is(":visible") == true)) {
            return;
        }

        var model = labelCollection.findWhere({'id': currentLabel.id});

        currentLabel = e.target;

        if (model != undefined && (model.get('comments') === undefined || model.get('comments') === "" || model.get('comments') === "[]")) {
            this.collection.remove(model);

            saveAllComments();
        }


        this.borderView.showCommentsListView(currentLabel.offsetLeft, currentLabel.offsetTop + circleLabelRadius + 10);

        return false;
    },

    render: function () {
        //this.$el.empty();
        this.collection.set(null);
        /*if (this.hasRendered == false) {
         this.$el.empty();
         this.$el.append('<img id="boardImg"/>');//画布背景图
         }*/
        return this;
    }
});

//带边框的容器
var BorderView = Backbone.View.extend({
    tagName: 'div',
    className: 'borderDiv',

    events: {
        'click #cancel': 'onCancelClick'

    },

    initialize: function () {
        this.hasRendered = false;
        this.hasCommentListViewAppendToContainer = false;

        //评论列表容器
        this.commentsContainer = new CommentsContainer();
    },

    onCancelClick: function () {
        //this.commentsContainer.clearInputComment();

        this.$el.hide();
        var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        if (labelModel.get('comments') === "" || labelModel.get('comments') === "[]") {
            labelCollection.remove(labelModel);
        }
    },

    showCommentsListView: function (posX, posY) {
        this.commentsContainer.showCommentsListView();

        var $_el = this.render().$el;
        $_el.show();
        $_el.css('top', posY).css('left', posX);

        //第一次则append到container
        if (this.hasCommentListViewAppendToContainer == false) {
            $_el.appendTo($('#preViewPic'));
            this.hasCommentListViewAppendToContainer = true;
        }
    },

    render: function () {

        if (this.hasRendered === false) {
            this.hasRendered = true;
            this.$el.empty();
            this.$el.append("<div class='border-top'></div>");

            this.$el.append(this.commentsContainer.render().$el);

            this.$el.append("<div class='border-bottom'></div>");
        }
        return this;
    }

});

//评论列表和回复框的容器
var CommentsContainer = Backbone.View.extend({
    tagName: 'div',
    className: 'commentsContainer',

    events: {
        'click #submit': 'onSubmitClick',
    },

    initialize: function () {
        this.hasRendered = false;
        //回复框
        this.replyView = new ReplyView({
            model: new ReplyModel({
                //'comment': DEFAULT_COMMENT_HINT_TEXT
            })
        });
        //评论列表
        this.commentsListView = new CommentsListView({
            collection: commentsCollection //指定数据源

        });
    },

    /*clearInputComment: function () {
        this.replyView.model.set('comment', DEFAULT_COMMENT_HINT_TEXT);
    },*/

    /**
     * 提交评论
     */
    onSubmitClick: function () {

        //1、验证
        var commentText = this.$('.replyView textarea').val();

        if (commentText == undefined || commentText == '') {
            alert('评论不能为空！');
            return;
        }

        //2、更新评论列表
        var commentItemModel = new CommentItemModel({
            'id': guid(),
            'comment': commentText,
        });
        this.commentsListView.collection.push(commentItemModel);

        this.commentsListView.el.scrollTop = this.commentsListView.el.scrollHeight;

        //3、保存当前选中的label所有的评论数据（json字符串格式）
        var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        labelModel.set({'comments': JSON.stringify(this.commentsListView.collection)});//JSON.stringify(this.collection)

        // 4、提交到服务器
        saveAllComments();

        //5、通知评论输入框，清除输入
        //this.replyView.model.set('comment', DEFAULT_COMMENT_HINT_TEXT);
        this.replyView.model.set('comment', "");

    },

    /**
     * 创建展开的评论列表
     * @param posX
     * @param posY
     */
    showCommentsListView: function () {

        this.commentsListView.collection.reset(null);

        var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        if (labelModel != undefined) {
            var comments = JSON.parse(labelModel.get('comments'));

            for (var i = 0; i < comments.length; i++) {
                var commentItemModel = new CommentItemModel({
                    'id': comments[i].id,
                    'comment': comments[i].comment
                });

                this.commentsListView.collection.push(commentItemModel);
            }
        }
        //刷新输入框缓存
        this.replyView.render();
    },

    render: function () {
        if (this.hasRendered == false) {
            this.hasRendered = true;
            this.$el.empty();
            this.$el.append(this.commentsListView.render().$el);
            this.$el.append(this.replyView.render().$el);
        }

        return this;
    }
});

//评论输入区域
var ReplyView = Backbone.View.extend({
    tagName: 'table',
    className: 'replyView',

    events: {
        'input #commentTextArea': 'onCommentChange',
        'change #commentTextArea': 'onCommentChange'
        //'focus #commentTextArea': 'clearText',

    },

    initialize: function () {
        this.hasRendered = false;
        this.listenTo(this.model, 'change', this.onModelChange);
    },

    onCommentChange: function () {
        var value = this.$('#commentTextArea').val();
        this.model.set('comment', value);

    },

    /*clearText: function () {
        if (this.$('#commentTextArea').val() === DEFAULT_COMMENT_HINT_TEXT) {
            this.$('textarea').val('');
        }
    },*/

    onModelChange: function () {
        var comment = this.model.get('comment');

        var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        labelModel.set({'inputCache': comment});

        this.toggleDisplay(comment);

    },

    toggleDisplay: function (comment) {
        //if (comment === DEFAULT_COMMENT_HINT_TEXT || comment === "" || comment == undefined) {
        if (comment === "" || comment == undefined) {
            this.$('#input_counter').text('140');
            this.$("tr").get(1).style.display = 'none';
        } else {
            this.$('#input_counter').text(140 - comment.length);
            this.$("tr").get(1).style.display = 'table-row';
        }
        this.$('textarea').val(comment);
    },

    render: function () {
        //var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        var inputCache = "";
        //if (labelModel != undefined) {
        //    inputCache = labelModel.get('inputCache');
        //}

        if (this.hasRendered === false) {
            this.hasRendered = true;

            this.$el.empty();
            this.$el.append('<tr><td><div><textarea id="commentTextArea" maxlength="140" cols="16" rows="3" style="resize:none; font-size: 10px;width: 198px;" placeholder="添加评论"></textarea><br><span style="float: right;font-size: 10px;">字</span><span id="input_counter" style="float: right;font-size: small;color: #c4af32;: #123;"></span><span style="float: right;font-size: 10px;">还可以输入</span></div></td></tr><tr hidden="hidden"><td><button id="submit"></button><button id="cancel"></button></td></tr>');
        }
        this.$('#commentTextArea').blur();
        this.toggleDisplay(inputCache);

        return this;
    }

});

//单条评论
var CommentItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'commentItemView',

    events: {
        //'mouseover .img-comment-delete': 'hoverDeleteImg',
        //'blur .img-comment-delete': 'blurDeleteImg',
        //'click .img-comment-delete': 'onClick'
    },

    onClick: function () {
        alert('click');
    },

    /* hoverDeleteImg: function () {
     alert(1);
     this.$('.img-comment-delete').attr('src', 'img/ic_delete_pressed.png');
     },

     blurDeleteImg: function () {
     this.$('.img-comment-delete').attr('src', 'img/ic_delete_normal.png');

     },*/

    render: function () {
        this.$el.empty();
        this.$el.html('<span class="commentItemSpan">' + this.model.get('comment') + '</span><span style="float: right;"><img id="' + this.model.get('id') + '" class="img-comment-delete" src="img/ic_delete_normal.png"/></span><hr>');

        return this;
    }
});

/**
 * 评论列表
 */
var CommentsListView = Backbone.View.extend({
    tagName: 'div',
    className: 'commentsListView',

    events: {
        //'click': 'onClick',    //义字符串的形式调用方法
        'click .img-comment-delete': 'deleteOneComment',    //义字符串的形式调用方法
    },

    initialize: function () {
        this.ids = {};
        this.views = [];
        this.collection.each(this.initViews, this);
        this.listenTo(this.collection, 'reset', this.resetView);
        this.listenTo(this.collection, 'add', this.addComment);
        this.listenTo(this.collection, 'remove', this.removeComment);

    },

    /**
     * 此处只初始化数据，不做渲染，完成初始化后手动调用render()
     * @param model
     */
    initViews: function (model) {

        var commentItemView = new CommentItemView({model: model});
        this.ids[model.cid] = commentItemView;
        this.views.push(commentItemView);
    },

    /**
     * 阻止点击事件传递给父View
     * @returns {boolean}
     */
    onClick: function () {
        //return false;
    },

    deleteOneComment: function (e) {
        var id = e.target.id;

        var model = this.collection.findWhere({'id': id});

        this.collection.remove(model);

        //3、保存当前选中的label所有的评论数据（json字符串格式）
        var labelModel = labelCollection.findWhere({'id': currentLabel.id});
        labelModel.set({'comments': JSON.stringify(this.collection)});//JSON.stringify(this.collection)

        // 4、提交到服务器
        saveAllComments();

        return false;
    },

    /**
     * 添加评论
     * 1、找到父节点
     * 2、计算其兄弟节点的个数，并以此计算当前的Item应该添加到哪个位置
     * 3、
     * @param model
     */
    addComment: function (model) {

        var commentItemView = new CommentItemView({model: model});

        var parentItemModel = this.collection.findWhere({'id': model.get('parentId')});
        var parentPosition = this.collection.indexOf(parentItemModel);

        var placePosition = parentPosition + this.collection.where({'parentId': model.get('parentId')}).length;//需要将此ItemView保存到的位置,这个值已经包含了父节点

        this.ids[model.get('id')] = commentItemView;

        var preItemView = this.views[parentPosition];
        if (preItemView == undefined) {
            //第一个
            this.$el.append(commentItemView.render().$el);
        } else {
            preItemView.$el.append(commentItemView.render().$el);
        }

        this.views.splice(placePosition, 0, commentItemView);  //把commentItemView加入到at的位置，0表示插入

        this.collection.remove(model, {silent: true});
        this.collection.add(model, {at: placePosition, silent: true});
    },

    removeComment: function (model) {

        for (var i = 0; i < this.views.length; i++) {
            if(this.views[i].model.get('id') === model.get('id')){
                this.views[i].remove();
                this.views.splice(i, 1);
                break;
            }
        }

        saveAllComments();

        this.render();

    },

    resetView: function () {
        this.ids = {};
        this.views = [];
        this.render();
    },

    render: function () {
        var _this = this;
        this.$el.empty();

        if (this.views.length > 0) {
            _.each(this.views, function (view) {
                var $_el = view.render().$el;
                _this.$el.append($_el);
            });
        }

        return this;
    }
});

//圆形标签
var CommentLabelView = Backbone.View.extend({
    tagName: 'div',
    className: 'commentLabelView',

    events: {
        'click': 'onBgImgClick'
    },

    onBgImgClick: function () {

    },

    render: function () {
        //this.$el.append('<img src="img/ic_close_normal.png" style="float: right;" alt="删除"/>');
        return this;
    }
});

/**
 * 保存所有标签以及评论数据
 */
function saveAllComments() {
    var comments = JSON.stringify(labelCollection.toJSON());

    //去除转义
    comments = comments.replace(/\\"/g, '"');
    comments = comments.replace(/"\[/g, '[');
    comments = comments.replace(/]"/g, ']');

    /*$.post(server_url + '/picAddress/modifyComments/' + picId,
        {'comments': comments}
    ).done(function (data) {

        }).fail(function () {
            //alert('保存数据失败，请重试！');
        });
    */
}