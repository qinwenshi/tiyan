/**
 * Created by hua on 15/11/13.
 * 因为回复框和评论列表在同一时间只会显示一个，所以commentsListView和replyView定义为全局变量以便使用
 */


/**
 * 初始化画布
 */
function initContainer(preData) {
    var container = new Container({
        collection: labelCollection  //初始化时以label为数据源
    });

    var picUrl;

    picId = preData.id;
    picUrl = preData.picUrl;
    container.render()
        .$el.css("background-image", "url('" + picUrl + "')")
        .css("background-repeat", "no-repeat")
        .css("width", preData.width+'px')
        .css("height", preData.height+'px');
    (function (data) {
            
            if (data.comments != "" && data.comments != null) {
                var comments = JSON.parse(data.comments);

                for (var i = 0; i < comments.length; i++) {
                    var labelModel = new LabelModel({
                        'id': comments[i].id,
                        'posX': comments[i].posX,
                        'posY': comments[i].posY,
                        'comments': JSON.stringify(comments[i].comments)
                    });

                    labelCollection.push(labelModel);
                }
            }
    })(preData);
    
    return container.$el;
}
