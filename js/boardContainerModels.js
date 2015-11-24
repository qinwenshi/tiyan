/**
 * Created by hua on 15/11/18.
 */

var DEFAULT_COMMENT_HINT_TEXT = "添加评论";

//评论框数据模型
var ReplyModel = Backbone.Model.extend({
    defaults: {
        'comment': DEFAULT_COMMENT_HINT_TEXT
    }
});

//圆形标签数据模型
var LabelModel = Backbone.Model.extend({
    defaults: {
        'id': '',
        'inputCache': DEFAULT_COMMENT_HINT_TEXT,
        'comments': '[]',
        'posX': 0,
        'posY': 0
    }
});

var LabelCollection = Backbone.Collection.extend({
    model: LabelModel
});

//单条评论数据
var CommentItemModel = Backbone.Model.extend({
    defaults: {
        'id': '0',
        'comment': ''
    }
});

//评论列表数据
var CommentsCollection = Backbone.Collection.extend({
    model: CommentItemModel
});

/**
 * 下面进行定义
 */

//缓存评论列表数据
var commentsCollection = new CommentsCollection();

//缓存label数据
var labelCollection = new LabelCollection();