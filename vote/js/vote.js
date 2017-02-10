/*
*  功能 ：移动端投票应用模板
*
*  @author：yujiyang
*/
$(function(){
	var voteSystem = {
		//全局变量
		businessId:102,//投票组Id
		votesArray:[],//投票对象素组
		isVote:false,//是否投过票
		//方法
		init:function(){
			//初始化
			var me = this;
			//获取和加载投票组数据
			me.getVotesData(me.businessId);
			//绑定事件
			me.bindHandEvent();
			//me.initShare();
			//me.wxShare();
		},
		//利用cookie来实现投票唯一性
		setCookie:function(name,value,hours,path,domain,secure){
          var cdata = name + "=" + value;
          if(hours){
              var d = new Date();
              d.setHours(d.getHours() + hours);
              cdata += "; expires=" + d.toGMTString();
          }
          cdata +=path ? ("; path=" + path) : "" ;
          cdata +=domain ? ("; domain=" + domain) : "" ;
          cdata +=secure ? ("; secure=" + secure) : "" ;
          document.cookie = cdata;
      	},
      	//利用cookie来判断投票是否已经投过
       	checkCookie:function(name){
          var reg = eval("/(?:^|;\\s*)" + name + "=([^=]+)(?:;|$)/"); 
          return reg.test(document.cookie) ? true : false;
      	},
		//获取投票对象组信息
		getVotesData:function(id){
			var me = this;
			var id = id || "";
			var url = '/votes/business/';
			var dataParam = {
				"business_id" :id 
			};
			//post
			$.ajax({
				url:url,
				data:dataParam,
				type:'POST',
				success:function(data){
					if(data.error_no=="0" && data.resultList){
						me.votesArray = data.resultList;
						me.loadVotesDom(me.votesArray);
					}
					else{
						alert(data.error_info);
					}
				},
				error:function(xhr,type){
					console.log(xhr);
				},
				complete:function(){
					console.log("投票对象信息正在获取...");
				}
			});
		},
		//加载投票对象
		loadVotesDom:function(arrs){
			var me = this;
			var arrs = arrs || [];
			var l = arrs.length;
			var html = "";
			for(var i =0; i<l; i++){
				html +='<li class="block" data-id="'+arrs[i].vote_id+'" data-img="'+arrs[i].img_url+'" data-title="'+arrs[i].vote_name+'" data-info="'+arrs[i].vote_content+'">'+
						'<div class="title">'+arrs[i].vote_name+'</div>'+
						'<div class="img-wrap">'+
						'<img src="'+arrs[i].img_url+'"alt="">'+
						'</div>'+
						'<div class="vote-wrap">'+
						'<div class="vote vote-num">票数：'+arrs[i].vote_sum+'</div>'+
						'<div class="vote vote-btn"></div>'+
						'</div>'+
						'<span class="idx">'+(parseInt(i)+1)+'</span>'+
						'</li>';
			}
			$(".vote-view .cont").html(html);
			$(".vote-view .block .vote-btn").on("click",function(){
				var $parent= $(this).parents('li');
				var id = $parent.data("id");
				if(me.checkCookie(id)){
					alert("您已经投过票了！");
				}
				else{
					me.addVoteNum(id);
				}
			});
			$(".vote-view .block .img-wrap").on("click",function(){
				var $parent= $(this).parents('li');
				var img = $parent.data("img");
				var title = $parent.data("title");
				var info = $parent.data("info");
				
				//图片
				$(".vote-pop .img-wrap").find("img").attr("src",img);
				//标题
				$(".vote-pop .vote-title").text(title);
				//信息
				//$(".vote-pop .vote-info").text(info);

				$(".vote-pop").addClass('show');
			});

			var containerH = $(window).height();
			var view = $(".vote-view");
			var head = $(".vote-view .head");
			var foot = $(".vote-view .footer");
			var cont = $(".vote-view .cont");
			var viewH = view.outerHeight(true);
			var headH = head.outerHeight(true);
			var contH = cont.outerHeight(true);
			var footH = foot.outerHeight(true);
			if(containerH>viewH){
				console.log(viewH)
				cont.outerHeight(containerH-headH-footH-10);
			}
		},
		//添加投票
		addVoteNum:function(id){
			var me = this;
			var id = id || "";
			var url = '/votes/voteIncrease/';
			var dataParam = {
				"vote_id" :id 
			};
			//post
			$.ajax({
				url:url,
				data:dataParam,
				type:'POST',
				success:function(data){
					if(data.error_no=="0"){
						me.setCookie(id,id,24*365,"/");
						me.getVotesData(me.businessId); 
						alert(data.error_info);
					}
					else{
						alert(data.error_info);
					}
				},
				error:function(xhr,type){
					console.log(xhr);
				},
				complete:function(){
					console.log("投票对象信息正在获取...");
				}
			});
		},
		bindHandEvent:function(){
			var me = this;
			$(".vote-pop .back-btn").on("click",function(){
				$(".vote-pop").removeClass('show');
			});
		},
		//设置分享方法
		initShare:function(){
			var me = this;
			var l = location;
			me.share = ["京东HD iPad 带你走个心","打开时光日历，陪你走个心",
			encodeURIComponent("//h5.m.jd.com/active/nnV7aXG2ZxAPkfenW87GHqcTTd1/index.html"),
			"//h5.m.jd.com/active/nnV7aXG2ZxAPkfenW87GHqcTTd1/icon20160105151131.png"];
			if (document.addEventListener) {
				document.addEventListener("WeixinJSBridgeReady", me.wxShare, false)
			} 
			else {
				if (document.attachEvent) {
					document.attachEvent("WeixinJSBridgeReady", me.wxShare);
					document.attachEvent("onWeixinJSBridgeReady", me.wxShare);
				}
			}
		},
		//微信分享
		wxShare:function(){
			var me = this;
			WeixinJSBridge.on("menu:share:appmessage", function(b) {
				var f = me.share[3],
					c = decodeURIComponent(me.share[2]);
				var e = me.share[0];
				var d = me.share[1];
				WeixinJSBridge.invoke("sendAppMessage", {
					img_url: f,
					img_width: "240",
					img_height: "240",
					link: c,
					desc: d,
					title: e
				},function(g){})
			});
	        WeixinJSBridge.on("menu:share:timeline", function(b) {
	            var f = me.share[3],
	                c = decodeURIComponent(me.share[2]);
	            var e = me.share[0];
	            var d = me.share[1];
	            WeixinJSBridge.invoke("shareTimeline", {
	                img_url: f,
	                img_width: "240",
	                img_height: "240",
	                link: c,
	                desc: e,
	                title: e
	            }, function(g) {})
	        });
		}
	}
	voteSystem.init();
});