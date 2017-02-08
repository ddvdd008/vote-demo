/*
*  功能 ：pc端 简易管理系统
*
*  @author：yujiyang
*/
$(function(){
	var voteCmsSystem = {
		//全局变量
		votesArray:[],//投票对象素组
		voteObj:{},//投票单个对象
		//方法
		init:function(){
			//初始化
			var me = this;
			//获取和加载投票组数据
			
			//绑定事件
			me.bindHandEvent();
		},
		//把页面数据保存在对象里
		saveVoteData:function(obj){
			var me =this;
			obj.title = $('.title .ipt').val();
			obj.imgUrl = $('.indexImage img').attr('src');
			obj.desc = $('.vote_info').val();
			return obj;
		},
		loadVotesDom:function(data){
			var me = this;
			var html = htm(function(data){/*
				<thead>
					<tr>
						<td><span>商户ID</span></td>
						<td><span>投票ID</span></td>
						<td><span>投票标题</span></td>
						<td><span>投票图片</span></td>
						<td><span>投票内容</span></td>
						<td><span>操作</span></td>
					</tr>
				</thead>
				<tbody>
				    var l = data.length;
				    if(l>0){
				    	for(var i=0;i<l;i++){
							<tr data-id="+data[i].vote_id+">
								<td>+data[i].business_id+</td>
								<td>+data[i].vote_id+</td>
								<td>+data[i].vote_name+</td>
								<td>
									<img src="+data[i].img_url+" alt="">
								</td>
								<td>+data[i].vote_content+</td>
								<td><span class="update">修改</span><span class="delete">删除</span></td>
							</tr>
				    	}
				    }
				</tbody>
			*/},data);
			$(".vote_tb").html(html);
		},
		loadPopPage:function(){

		};
		checkVoteAddData:function(obj){
			//console.log(obj)
			var checks = {
				checkTitle:function(){
					var reg = /.{1,20}/,
						check = reg.test(obj.title);
					if(!check){
						_.ui.pop.fail("投票标题不能为空，限制20个字符！");
						return false;
					}else{
						return true;
					}
				},
				checkImg:function(){
					if(obj.imgUrl=="javascript:;"){
						_.ui.pop.fail("请上传图片！");
						return false;
					}else{
						return true;
					}
				},
				checkInfo:function(){
					var reg = /.{1,50}/,
						check = reg.test(obj.desc);
					if(!check){
						_.ui.pop.fail("投票内容不能为空，限制50个字符！");
						return false;
					}else{
						return true;
					}
				}
			};
			if(checks.checkTitle() && checks.checkImg() && checks.checkInfo()){
				return true;
			}
			return false;
		},
		bindHandEvent:function(){
			var me = this;
			//新建
			$(".view-cms .add").on("click",function(){
				var obj = {};
				if(!me.checkVoteAddData(me.saveVoteData(obj))) return;

				var url = '/votes/voteAdd/';
				var dataParam = me.saveVoteData(obj);
				//post
				$.ajax({
					url:url,
					data:dataParam,
					dataType:'json',
					type:'POST',
					success:function(data){
						_.ui.pop.fail(data.error_info);
					},
					error:function(xhr,type){
						console.log(xhr);
					},
					complete:function(){
						console.log("投票项目正在新建...");
					}
				});
			});
			//查询
			$(".search_wrap .search").on("click",function(){
				var me = this;
				var id = $(".search_ipt").val();
				var url = 'http://10.8.135.104:3088/votes/business/10000';
				var dataParam = {
					"business_id" :id 
				};
				//post
				$.ajax({
					url:url,
					//dataParam:dataParam,
					type:'POST',
					success:function(data){
						if(data.error_no=="0" && data.resultList){
							me.votesArray = data.resultList;
							me.loadVotesDom(me.votesArray);
						}
						else{
							console.log(data.error_info);
						}
					},
					error:function(xhr,type){
						console.log(xhr);
					},
					complete:function(){
						console.log("投票对象信息正在获取...");
					}
				});
			});
			//修改
			$(".vote_tb .update").on("click",function(){
				var me = this;
				var $parent= $(this).parents('tr');
				var id = $parent.data("id");
				
				var url = '/votes/voteUpdate/';
				var dataParam = {
					"vote_id":id
				};
				//post
				$.ajax({
					url:url,
					data:dataParam,
					dataType:'json',
					type:'POST',
					success:function(data){
						if(data.error_info="0" && data.resultMap){
							me.voteObj = data.resultMap;
							me.loadPopPage(me.voteObj);
						}
						else{
							_.ui.pop.fail(data.error_info);
						}
					},
					error:function(xhr,type){
						console.log(xhr);
					},
					complete:function(){
						console.log("投票项目正在删除...");
					}
				});
			});
			//删除
			$(".vote_tb .delete").on("click",function(){
				var me = this;
				_.ui.pop.confirm("确认删除吗？",function(){
					var $parent= $(this).parents('tr');
					var id = $parent.data("id");
					
					var url = '/votes/voteDelete/';
					var dataParam = {
						"vote_id":id
					};
					//post
					$.ajax({
						url:url,
						data:dataParam,
						dataType:'json',
						type:'POST',
						success:function(data){
							_.ui.pop.fail(data.error_info);
						},
						error:function(xhr,type){
							console.log(xhr);
						},
						complete:function(){
							console.log("投票项目正在删除...");
						}
					});
				});
			});
		}
	};
	_.ns("_.ui.pop.votePop",function(){

		var _=this;
		
		var view=null;
		
		var init;
		var option;
		var imgIpt,imgData={};
		var imgJcrop;
		
		this.title='修改投票信息'; 
		
		this.getView = function(){
			if(!view){
				view=_.view();
				init=_.item({
				title:true,
				content: function(){/*
					<div class="vote_update_wrap">
						<div class="dl in businessId">
							<b>商户ID</b>
							<div class="dd">
								<div class="ip">
									<input id="vote_title" disabled="disabled" class="vote_title ipt" placeholder="请输入投票标题" type="text" maxlength="10">
									<div class="tip">
										<div class="tip_box">
											<p>不超过10字</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="dl in title">
							<b>投票标题</b>
							<div class="dd">
								<div class="ip">
									<input id="vote_title" class="vote_title ipt" placeholder="请输入投票标题" type="text" maxlength="10">
									<div class="tip">
										<div class="tip_box">
											<p>不超过10字</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="dl in indexImage">
							<b>封面图</b>
							<div class="dd">
								<input id="vote_img" class="vote_img" placeholder="请输入投票标题" type="file" maxlength="10">
								<img src="javascript:;" alt="">
							</div>
						</div>
						<div class="dl in info">
							<b>投票内容</b>
							<div class="dd">
								<div class="ip">
									<textarea class="ta vote_info" id="vote_info" placeholder="请输入参加投票比赛项目的简介"maxlength="50"></textarea>
									<div class="tip">
										<div class="tip_box">
											<p>不超过50字</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="b add">新增</div>
					</div>
				*/},
				save:'上传',
				cancle:'取消'
				});
				view.append(init);
			}
			return view;
		};

		this.css(function(){/*
			.jcrop-holder{direction:ltr;text-align:left;}
			.jcrop-vline,.jcrop-hline{background:#FFF url(../pic/Jcrop.gif);font-size:0;position:absolute;}
			.jcrop-vline{height:100%;width:1px!important;}
			.jcrop-vline.right{right:0;}
			.jcrop-hline{height:1px!important;width:100%;}
			.jcrop-hline.bottom{bottom:0;}
			.jcrop-tracker{-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;height:100%;width:100%;}
			.jcrop-handle{background-color:#333;border:1px #EEE solid;font-size:1px;height:7px;width:7px;}
			.jcrop-handle.ord-n{left:50%;margin-left:-4px;margin-top:-4px;top:0;}
			.jcrop-handle.ord-s{bottom:0;left:50%;margin-bottom:-4px;margin-left:-4px;}
			.jcrop-handle.ord-e{margin-right:-4px;margin-top:-4px;right:0;top:50%;}
			.jcrop-handle.ord-w{left:0;margin-left:-4px;margin-top:-4px;top:50%;}
			.jcrop-handle.ord-nw{left:0;margin-left:-4px;margin-top:-4px;top:0;}
			.jcrop-handle.ord-ne{margin-right:-4px;margin-top:-4px;right:0;top:0;}
			.jcrop-handle.ord-se{bottom:0;margin-bottom:-4px;margin-right:-4px;right:0;}
			.jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-4px;margin-left:-4px;}
			.jcrop-dragbar.ord-n,.jcrop-dragbar.ord-s{height:7px;width:100%;}
			.jcrop-dragbar.ord-e,.jcrop-dragbar.ord-w{height:100%;width:7px;}
			.jcrop-dragbar.ord-n{margin-top:-4px;}
			.jcrop-dragbar.ord-s{bottom:0;margin-bottom:-4px;}
			.jcrop-dragbar.ord-e{margin-right:-4px;right:0;}
			.jcrop-dragbar.ord-w{margin-left:-4px;}
			.jcrop-light .jcrop-vline,.jcrop-light .jcrop-hline{background:#FFF;filter:alpha(opacity=70)!important;opacity:.70!important;}
			.jcrop-light .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#000;border-color:#FFF;border-radius:3px;}
			.jcrop-dark .jcrop-vline,.jcrop-dark .jcrop-hline{background:#000;filter:alpha(opacity=70)!important;opacity:.7!important;}
			.jcrop-dark .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#FFF;border-color:#000;border-radius:3px;}
			.solid-line .jcrop-vline,.solid-line .jcrop-hline{background:#FFF;}
			.jcrop-holder img,img.jcrop-preview{max-width:none;}
		*/});

		this.load = function(){
			var img = view.find("#upload_img");
			img.attr("src",option.url);
			if(imgJcrop){
				imgJcrop.destroy();
			}
			skip = false;
			view.find("#upload_img").css({
				'width':option.orgImgWidth+'px',
				'height':option.orgImgHeight+'px'
			});
			imgJcrop = $.Jcrop('#upload_img',{
				aspectRatio:option.aspectRatio,
				boxWidth:300,
				boxHeight:Math.round(300/option.radio),
				minSize:[option.limiteWidth,option.limiteHeight],
				setSelect:[0,0,option.orgImgWidth,option.orgImgHeight],
				onChange:function(e){
					$(".jcrop-keymgr").css("opacity",0);
					imgData.imgFile = imgIpt[0].files[0];
					imgData.cut_x1 = Math.round(e.x);
					imgData.cut_y1 = Math.round(e.y);
					imgData.cut_width = Math.round(e.w);
					imgData.cut_height = Math.round(e.h);
				}
			});
		};
		
		this.active=function(data,file){
			option = data;
			imgIpt = file;
			_.show();
		}
		
		this.save = function(){
			imgIpt.val("");
			if(!skip){
				_cutUploadImg(option,imgData);
				skip = true;
			}
		};

		this.cancle = function(){
			imgIpt.val("");
			_.hide();
		};

	});
	voteCmsSystem.init();
});