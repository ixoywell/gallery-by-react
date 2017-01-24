require('normalize.css/normalize.css');
require('styles/App.less');

import React from 'react';
import ReactDOM from 'react-dom';

var imageDatas = require('../stores/imgDatas.json');
//let yeomanImage = require('../images/yeoman.png');
//console.log(imageDatas);

imageDatas = (function getImgURL(imageDatasArr){
    for(var i = 0, j = imageDatasArr.length; i < j; i++ ) {
      var singleImgData = imageDatasArr[i];

      singleImgData.imageURL = require('../images/series/' + singleImgData.imgName);
      imageDatasArr[i] = singleImgData;
    }
    //console.log(imageDatasArr);
    return imageDatasArr;
})(imageDatas);
/*
 * 获取区间内的一个随机只
 */
function getRangeRandom(low, high){
    return Math.ceil(Math.random() * (high - low) + low);
}
/*
 * 随机选取-30°~30°的角度范围
 */
function get30DegRandom(){
    return ((Math.random()>0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

//图片组件
var ImgFigure = React.createClass({
    handleClick(e){

        //如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    render: function () {

        var styleObj = {};
        if(this.props.arrange.pos){
            styleObj = this.props.arrange.pos;
        }

        if(this.props.arrange.rotate){
            (['-moz-','-ms-','-webkit-','']).forEach(function(value){
                styleObj[value+'transform']='rotate('+ this.props.arrange.rotate+'deg)';
            }.bind(this));
        }

        if(this.props.arrange.isCenter){
            styleObj.zIndex = 11;
        }

        var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return(
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.desc}
                            </p>
                        </div>
                </figcaption>
            </figure>
        );
    }
})

//控制组件
var ControllerUnit = React.createClass({
    handleClick(e){

        //如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    render(){
        var controllerUnitClassName = 'controller-unit';

        if(this.props.arrange.isCenter){
            controllerUnitClassName += ' is-center';

            if(this.props.arrange.isInverse){
                controllerUnitClassName += ' is-inverse';
            }
        }

        return(<span className={controllerUnitClassName} onClick={this.handleClick}></span>);
    }
})

class AppComponent extends React.Component {
    constructor(props){
        super(props);
        this.Constant = {
            centerPos:{
                left: 0,
                right: 0
            },
            hPosRange:{
                leftSecX:[0,0],
                rightSecX:[0,0],
                y:[0,0]
            },
            vPosRange:{
                x:[0,0],
                topY:[0,0]
            }
        };
    }
    Constant = {
        centerPos:{
            left: 0,
            right: 0
        },
        hPosRange:{  //水平方向取值范围
            leftSecX: [0, 0],
            rightSecX: [0,0],
            y: [0,0]
        },
        vPosRange:{
            x: [0, 0],
            topY: [0, 0]
            }
    };

    state = {imgsArrangeArr:[
        /*{
         pos:{
             left:'0',
             top:'0'
         },
         rotate:0, //旋转角度
         isInverse:false //图片正反
         isCenter:false //图片是否居中
         }*/
    ]}

    /*
     * 翻转图片
     *
     */
    inverse(index){
        return function(){
            var imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

            this.setState({
                imgsArrangeArr:imgsArrangeArr
            });
        }.bind(this);
    }

    /*
     * 重新布局所有图片
     * @param centerIndex 指定居中排布那个图片
     */
    rearrange(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],
            topImgNum = Math.ceil(Math.random()* 2), //取一个或者不取
            topImgSpliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        // 首先居中 centerIndex 的图片,居中的centerIndex不用旋转
        imgsArrangeCenterArr[0]={
            pos : centerPos,
            rotate : 0,
            isCenter : true
        }

        // 取出要布局上侧的图片状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value,index) {
            imgsArrangeTopArr[index] = {
                pos : {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            };
        })

        //布局位于两侧的图片
        for(var i = 0, len = imgsArrangeArr.length, k = len / 2; i < len; i++ ){
            var hPosRangeLORX = null;

            //前半部分布局左侧， 右半部分布局右侧
            if(i < k){
                hPosRangeLORX = hPosRangeLeftSecX;
            }else{
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] = {
                pos:{
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate:get30DegRandom(),
                isCenter: false
                };
        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    }
    //利用rearrange，居中对应index的图片
    center(index){
        return function(){
            this.rearrange(index);
        }.bind(this);
    }

//    getInitialState = function(){
//        return{
//            imgsArrangeArr:[
//                /*{
//                    pos:{
//                        left: '0',
//                        top: '0'
//                    }
//                }*/
//            ]
//        }
//}
// 组件加载后，为每张图片计算其位置范围
    componentDidMount(){
    //获取舞台大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW/2),
        halfStageH = Math.ceil(stageH/2);

    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2);

        //计算中心图片的位置点
        this.Constant.centerPos = {
            left:halfStageW - halfImgW,
            top: halfStageH - halfImgH
        }

        //计算左侧，右侧区域图片排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;

        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW*3;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        //计算上侧区域图片排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        var num = Math.floor(Math.random() * 10);
        this.rearrange(num);
}

  render() {
    //return (
    //  <div className="index">
    //    <img src={yeomanImage} alt="Yeoman Generator" />
    //<span>hello reactqweqew	qweqerqwe</span>
    //    <div className="notice">Please edit <code>src/components/Main.js</code> to get started!</div>
    //  </div>
    //);
      var controllerUnits = [],
          imgFigures = [];

      imageDatas.forEach(function (value,index) {

          if (!this.state.imgsArrangeArr[index]) {
              this.state.imgsArrangeArr[index] = {
                  pos: {
                      left: '0',
                      top: '0'
                  },
                  rotate: 0,
                  isInverse: false,
                  inCenter: false
              }
          }

          imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure'+ index}
                                     arrange={this.state.imgsArrangeArr[index]}
                                     inverse={this.inverse(index)}
                                     center={this.center(index)}/>);

          controllerUnits.push(<ControllerUnit key={index}
              arrange={this.state.imgsArrangeArr[index]}
              inverse={this.inverse(index)}
              center={this.center(index)}/>);
      }.bind(this));

      return (
          <section className="stage" ref="stage">
              <section className ="img-sec">
                  {imgFigures}
              </section>
              <nav className="controller-nav">
                  {controllerUnits}
              </nav>
          </section>
      );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
