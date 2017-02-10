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
		saveVoteData:function(){
			var me =this;
			var obj = {};
			obj.business_id = $('.view-cms .business_id .ipt').val();
			obj.vote_name = $('.view-cms .title .ipt').val();
			obj.img_url = $('.view-cms .indexImage img').attr('src');
			obj.vote_content = $('.view-cms .vote_info').val();
			return obj;
		},
		saveUpdateVoteData:function(){
			var me =this;
			var obj = {};
			obj.business_id = $('.view-pop .business_id .ipt').val();
			obj.vote_id = $('.view-pop .update_cont_wrap').data("id");
			obj.vote_name = $('.view-pop .title .ipt').val();
			obj.img_url = $('.view-pop .indexImage img').attr('src');
			obj.vote_content = $('.view-pop .vote_info').val();
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
							<tr data-businessid="+data[i].business_id+" data-id="+data[i].vote_id+">
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
			//修改
			$(".vote_tb .update").on("click",function(){
				var $parent= $(this).parents('tr');
				var id = $parent.data("id");
				me.getVoteFun(id);
			});
			//删除
			$(".vote_tb .delete").on("click",function(){
				var $parent= $(this).parents('tr');
				var id = $parent.data("id");
				var businessid = $parent.data("businessid");
				_.ui.pop.confirm("确认删除吗？",function(){
					me.deleteVoteFun(id,businessid);
				});
			});
		},
		loadPopPage:function(obj){
			var me = this;
			var html = htm(function(data){/*
				<div class="update_cont_wrap" data-id="+data.vote_id+">
					<div class="dl in business_id">
						<b>商户ID</b>
						<div class="dd">
							<div class="ip">
								<input id="business_id" class="business_id ipt" value="+data.business_id+" disabled="disabled" type="text" maxlength="10">
								<div class="tip">
									<div class="tip_box">
										<p>不超过10字，同一项目的投票项目 商户ID录入一致</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="dl in title">
						<b>投票标题</b>
						<div class="dd">
							<div class="ip">
								<input id="vote_title" class="vote_title ipt" value="+data.vote_name+" placeholder="请输入投票标题" type="text" maxlength="10">
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
							<div class="update_wrap have_img">
								<input id="vote_img" class="vote_img" type="file">
								<div class="img_wrap show">
									<img src="+data.img_url+" alt="">
									<span class="update_img">更改图片</span>
								</div>
							</div>
						</div>
					</div>
					<div class="dl in info">
						<b>投票内容</b>
						<div class="dd">
							<div class="ip">
								<textarea class="ta vote_info" id="vote_info"  placeholder="请输入参加投票比赛项目的简介"maxlength="50">+data.vote_content+</textarea>
								<div class="tip">
									<div class="tip_box">
										<p>不超过50字</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="btn">
						<div class="b update">修改</div>
						<div class="b cancel">取消</div>
					</div>
				</div>
			*/},obj);
			$(".view-pop").html(html);
			$(".view-pop").addClass('show');
			$(".view-pop .vote_img").change(function(){
				var file = $(".view-pop .indexImage").find('.vote_img')[0].files[0];
				me.uploadImgFun(file,1);
			});
			//update img
			$(".view-pop .update_img").on("click",function(){
				$(".view-pop .vote_img").click();
			});
			$(".view-pop .update").on("click",function(){
				var obj = {};
				obj = me.saveUpdateVoteData();
				if(!me.checkVoteAddData(obj)) return;
				me.updateVoteFun(obj);
			});
			$(".view-pop .cancel").on("click",function(){
				$(".view-pop").removeClass('show');
			});
		},
		uploadImgFun:function(file,type){
			var me = this;
			var url = '/imgs/imgAdd/';
			var formData = new FormData();
			formData.append("img_file",file);
			$.ajax({
				url:url,
				data:formData,
				//dataType:'json',
				type:'POST',
				contentType:false,
				processData:false,
				success:function(data){
					if(type==0){
						me.setMainImgFun(data);
					}
					else{
						me.setSubImgFun(data);
					}
				},
				error:function(xhr,type){
					_.ui.pop.fail(xhr.statusText);
					skip = false;
					console.log(xhr);
				},
				complete:function(){
					console.log("图片正在裁剪...");
				}
			});
		},
		setMainImgFun:function(url){
			$(".view-cms .indexImage .img_wrap").addClass('show');
			$(".view-cms .indexImage .img_wrap").find("img").attr("src",url);
			$(".view-cms .indexImage .update_wrap").addClass('have_img');
		},
		setSubImgFun:function(url){
			$(".view-pop .indexImage .img_wrap").addClass('show');
			$(".view-pop .indexImage .img_wrap").find("img").attr("src",url);
			$(".view-pop .indexImage .update_wrap").addClass('have_img');
		},
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
		//新建方法
		addVoteFun:function(obj){
			var me = this;
			var obj = obj || {};
			var url = '/votes/voteAdd/';
			var dataParam = obj;
			//post
			$.ajax({
				url:url,
				data:dataParam,
				dataType:'json',
				type:'POST',
				success:function(data){
					if(data.error_no=="0"){
						_.ui.pop.done(data.error_info);
					}
					else{
						_.ui.pop.fail(data.error_info);
					}
				},
				error:function(xhr,type){
					console.log(xhr);
				},
				complete:function(){
					console.log("投票项目正在新建...");
				}
			});
		},
		//查询方法
		searchVotesFun:function(id){
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
						$(".vote_tb").html("");
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
		},
		//获取单个vote方法
		getVoteFun:function(id){
			var me = this;
			var id = id || "";
			var url = '/votes/voteGet/';
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
					if(data.error_no="0" && data.resultMap){
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
					console.log("投票项目正在获取...");
				}
			});
		},
		//修改方法
		updateVoteFun:function(obj){
			var me = this;
			var obj = obj || {};
			var url = '/votes/voteUpdate/';
			var dataParam = obj;
			//post
			$.ajax({
				url:url,
				data:dataParam,
				dataType:'json',
				type:'POST',
				success:function(data){
					if(data.error_no=="0"){
						_.ui.pop.done(data.error_info);
					}
					else{
						_.ui.pop.fail(data.error_info);
					}
				},
				error:function(xhr,type){
					console.log(xhr);
				},
				complete:function(){
					console.log("投票项目正在新建...");
				}
			});
		},
		//删除方法
		deleteVoteFun:function(id,businessid){
			var me = this;
			var id = id || "";
			var businessid = businessid || "";
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
					if(data.error_no=="0"){
						_.ui.pop.done(data.error_info);
						me.searchVotesFun(businessid);
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
		},
		bindHandEvent:function(){
			var me = this;
			//upload img
			$(".view-cms .vote_img").change(function(){
				var file = $(".view-cms .indexImage").find('.vote_img')[0].files[0];
				me.uploadImgFun(file,0);
			});
			//update img
			$(".view-cms .update_img").on("click",function(){
				$(".view-cms .vote_img").click();
			});
			//新建
			$(".view-cms .add").on("click",function(){
				var obj = {};
				obj = me.saveVoteData();
				if(!me.checkVoteAddData(obj)) return;
				me.addVoteFun(obj);
			});
			//查询
			$(".search_wrap .search").on("click",function(){
				var id = $(".search_ipt").val();
				me.searchVotesFun(id);
			});
		}
	};
	voteCmsSystem.init();
});