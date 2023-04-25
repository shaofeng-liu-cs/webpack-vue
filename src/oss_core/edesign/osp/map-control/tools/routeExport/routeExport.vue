<template>
  <div class="map-icon-content" v-show="showRouteExport">

    <Popover placement="bottom" trigger="hover" ref="popover" popClass="gis-tool-popover">
      <div class="map-icon icon_osp icon_ospDesignExport" :title="$t('EXPORT')"></div>
      <ul slot="content" class="v9-popover-ul">
        <li ref="Desgin" @click="imgHadelModel" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_ROUTE')">
          <div class="map-icon icon_osp icon_osproute"></div>
        </li>
        <div class="v9-line"></div>
        <li ref="Desgin" @click="exportCad" title="CAD">
          <div class="map-icon icon_osp icon_ospDrawinginformation"></div>
        </li>
      </ul>
    </Popover>
    <popup :popupObj="showImgInfo" @popupClose="imgPopupClose" @popupOk="rotueImgExport">
      <template v-slot:popupBody>
        <div class="showImgContentBox">
          <div class="showImgHeadSetting">
            <span class="head_item">{{$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_NUM')}}：</span>
            <span class="head_item">
              <input v-model="fengeNum" @change="fengeNumChange" type="number" class="headInput" />
            </span>
            <span class="head_item m-l-lg">
              <button type="button" class="btn btn-primary" @click="splitMapImage">{{$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_APPLY')}}</button>
            </span>
          </div>
          <div class="showImgFgBox" ref="showImgFgBox">
            <div v-if="scLoading" class="shengchegn_loading_box">
              <div class="loading_fenge_conetent">
                <div class="shengchegn_loading">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </div>
                <div v-if="scLoading==='down'" class="pro_num">
                  {{$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_IMAGE_DOWNING')}}
                </div>
                <div v-else class="pro_num">
                  {{$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_IMAGE_CRETEING')}} {{createImgIndex+1}} / {{allFengeImgNum}}
                </div>
              </div>
            </div>
            <div class="defalutImgShow" v-if="!showImgList.length">
              <img :src="defalutImgShow" />
            </div>
            <div v-else class="showImgItemBox" v-for="(item,index) in showImgList" :key="index">
              <span class="showImgItem_Img" v-for="(it,ind) in item" :key="ind">
                <img :src="it.src" :class="{hideImg:it.remove}">
                <span class="imgIndexSeq" v-if="!it.remove">{{it.index}}</span>
                <div class="imgHoverBox" v-if="!it.remove">
                  <i class="icon_osp icon_ospkejian m-r" @click="previewImg(it)"></i>
                  <i class="icon_osp icon_ospshanchu1" @click="handlePreviewImg(index,ind,'remove')"></i>
                </div>
                <div class="imgHoverBox" v-else>
                  <i class="icon_osp icon_ospxiayibuchehui" @click="handlePreviewImg(index,ind,'chehui')"></i>
                </div>
              </span>
            </div>
          </div>
        </div>
      </template>
    </popup>
  </div>
</template>

<script>
import PhotoViewer from 'photoviewer';
import html2canvas from 'html2canvas';
import JsZip from 'jszip';
import { prjdocsAdd, getEdsignConfig } from '@/oss_core/edesign/api/query/schema.js';
import { FILL } from '@/oss_core/base/symbol/DefaultSymbol';
export default {
  name: 'RouteExport',
  inject: ['getMapBox', 'getProjectInfo'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  data() {
    return {
      showImgInfo: {
        title: this.$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_APPLY'), // 弹框标题
        close: this.$t('CANCEL'), // 取消按钮内容
        ok: this.$t('EXPORT'), // 确认按钮内容
        modal: true, // 是否蒙层
        width: '100%', // 宽
        height: '100%', // 高
        show: false,
        el: 'body',
        zIndex: 10,
      }, //弹窗
      showRouteExport: false, //隐藏展示
      defalutImgShow: '', //默认展示的大图
      showImgList: [], //需要展示的切割图片数组
      fengeNum: 1, //分割的行列数
      scLoading: false, //分割时加载数据
      mapContent: null, //地图画布信息
      fgItemWidth: 0, //子元素的宽
      fgItemHeight: 0, //子元素的高
      showImgWidth: 0, //展示的图片宽
      downloadUrl: '', //下载连接
      downloadName: 'image', //下载名字
      currShowSrc: '',
      allFengeImgNum: 0,
      createImgIndex: 0,
    };
  },
  mounted() {
    // window.mapBox = this.mapBox;
  },
  watch: {},
  methods: {
    imgPopupClose() {
      this.showImgList = [];
      this.fengeNum = 1;
    },
    imgHadelModel() {
      this.showImgInfo.show = true;
      const mapContent = document.querySelector('.map-container .ol-unselectable');
      html2canvas(mapContent, {
        width: mapContent.clientWidth, //画布的宽
        height: mapContent.clientHeight, //画布的高
        scale: 1, //处理模糊问题
        useCORS: true, //开启跨域，这个是必须的
      }).then(canvas => {
        this.defalutImgShow = canvas.toDataURL('image/png');
      });
    },
    //分割网格
    splitMapImage() {
      if (this.fengeNum === 1) {
        this.showImgList = [];
        return;
      }
      //横向分割数，纵向分割数
      // const mapCanvas = document.querySelector('.map-container canvas[height]');
      const mapCanvas = document.querySelector('.map-container .ol-unselectable');
      const defalutExtent = this.mapBox.map.getExtent();
      const domWidth = mapCanvas.clientWidth;
      const domHeight = mapCanvas.clientHeight;
      const domSalce = domWidth / domHeight; //dom元素的宽高比
      this.mapBox.addTempLayer('highLightLayer');
      let gridRings = [];
      let gridGeoList = [];
      let fgItemWidth = domWidth / this.fengeNum; //分割的子元素-宽
      let fgItemHeight = fgItemWidth / domSalce; //分割的子元素-高

      for (let verI = 0; verI < this.fengeNum; verI++) {
        //纵向循环
        for (let tranI = 0; tranI < this.fengeNum; tranI++) {
          //横向循环
          let t_l_zb = [fgItemWidth * tranI, fgItemHeight * verI];
          let top_left = this.mapBox.map.toMapFromStage(t_l_zb[0], t_l_zb[1]); //上面左边角落点
          let t_c_zb = [fgItemWidth * tranI + fgItemWidth / 2, fgItemHeight * verI];
          let top_center = this.mapBox.map.toMapFromStage(t_c_zb[0], t_c_zb[1]); //上面中间点
          let t_r_zb = [fgItemWidth * (tranI + 1), fgItemHeight * verI];
          let top_right = this.mapBox.map.toMapFromStage(t_r_zb[0], t_r_zb[1]); //上面右边角落点
          let r_c_zb = [fgItemWidth * (tranI + 1), fgItemHeight * verI + fgItemHeight / 2];
          let right_center = this.mapBox.map.toMapFromStage(r_c_zb[0], r_c_zb[1]); //右边中间点
          let b_r_zb = [fgItemWidth * (tranI + 1), fgItemHeight * (verI + 1)];
          let bottom_right = this.mapBox.map.toMapFromStage(b_r_zb[0], b_r_zb[1]); //下方右边角落点
          let b_c_zb = [fgItemWidth * tranI + fgItemWidth / 2, fgItemHeight * (verI + 1)];
          let bottom_center = this.mapBox.map.toMapFromStage(b_c_zb[0], b_c_zb[1]); //下方中间点
          let b_l_zb = [fgItemWidth * tranI, fgItemHeight * (verI + 1)];
          let bottom_left = this.mapBox.map.toMapFromStage(b_l_zb[0], b_l_zb[1]); //下方左边角落点
          let l_c_zb = [fgItemWidth * tranI, fgItemHeight * verI + fgItemHeight / 2];
          let left_center = this.mapBox.map.toMapFromStage(l_c_zb[0], l_c_zb[1]); //左边中间点
          // console.log(`循环：${verI}_${tranI}`, t_l_zb, t_c_zb, t_r_zb, r_c_zb, b_r_zb, b_c_zb, b_l_zb, l_c_zb);
          gridRings.push([
            [top_left.x, top_left.y],
            [top_center.x, top_center.y],
            [top_right.x, top_right.y],
            [right_center.x, right_center.y],
            [bottom_right.x, bottom_right.y],
            [bottom_center.x, bottom_center.y],
            [bottom_left.x, bottom_left.y],
            [left_center.x, left_center.y],
          ]);
        }
      }

      gridRings.map((it, index) => {
        let polygonGeo = this.mapBox.createPolygonGeometry([it]);
        const polygonSymbol = FILL.NOCOLOR;
        let polygonGra = this.mapBox.addGeometry(`lsgrid_${index}`, polygonGeo, polygonSymbol, {}, 'highLightLayer');
        gridGeoList.push(polygonGra);
      });
      this.allFengeImgNum = gridGeoList.length;
      let showImgList = [];
      this.scLoading = true;
      this.createImgIndex = 0;
      const createImg = () => {
        console.log('开始截图...', this.createImgIndex);
        this.mapBox._map.__.once('rendercomplete', () => {
          console.log('rendercomplete');
          setTimeout(() => {
            html2canvas(mapCanvas, {
              width: mapCanvas.clientWidth, //画布的宽
              height: mapCanvas.clientHeight, //画布的高
              scale: 1, //处理模糊问题
              useCORS: true, //开启跨域，这个是必须的
            }).then(canvas => {
              let src = canvas.toDataURL('image/png');
              showImgList.push(src);
              // console.log('已添加图片:', this.createImgIndex);
              if (this.createImgIndex === gridGeoList.length - 1) {
                this.mapBox.map.setExtent(defalutExtent, true);
                let newImgList = [];
                for (let i = 0; i < this.fengeNum; i++) {
                  newImgList.push(showImgList.splice(0, this.fengeNum));
                }
                let newShowImglist = [];
                newImgList.map((item, index) => {
                  let ilist = [];
                  item.map((it, ind) => {
                    const imgIndex = index + ind * newImgList.length + 1;
                    ilist.push({
                      src: it,
                      index: imgIndex,
                      title: `image_${imgIndex}.png`,
                    });
                  });
                  newShowImglist.push(ilist);
                });
                this.showImgList = newShowImglist;
                this.scLoading = false;
              } else {
                this.createImgIndex = this.createImgIndex + 1;
                createImg();
              }
            });
          }, 200);
        });
        this.mapBox.map.setExtent(gridGeoList[this.createImgIndex].geometry.getExtent(), true);
        this.mapBox._tempLayerList.entries().next().value[1].removeFeatureById(gridGeoList[this.createImgIndex].id);
      };
      createImg();
      this.showImgInfo.show = true;
    },
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    uploadFiles(list) {
      let uploadFormData = new FormData();
      uploadFormData.append('label', 'Route');
      uploadFormData.append('delByLabel', true);
      uploadFormData.append('projectId', this.projectInfo.sprintId);
      list.map((it, i) => {
        if (!it.remove) {
          let file = this.dataURLtoBlob(it.src);
          uploadFormData.append('files', file, it.title);
        }
      });
      prjdocsAdd(uploadFormData).then(() => {
        fish.toast('success', this.$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_IMAGE_SAVE_SUCC'));
      });
    },
    downloadFile(url, name = 'image') {
      var a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', name);
      a.setAttribute('target', '_blank');
      let clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('click', true, true);
      a.dispatchEvent(clickEvent);
    },
    rotueImgExport() {
      console.log('导出...');
      let imglist = this.showImgList && this.showImgList.flat();
      //将base64转换为blob

      const downloadFileByBase64 = (base64, name) => {
        var myBlob = this.dataURLtoBlob(base64);
        var myUrl = URL.createObjectURL(myBlob);
        this.downloadFile(myUrl, name);
      };
      if (imglist.length) {
        const ysDom = $(this.$refs.showImgFgBox)[0];
        const targetDom = ysDom.cloneNode(true);
        document.body.appendChild(targetDom);
        this.scLoading = 'down';
        targetDom.style.width = ysDom.clientWidth * 2 + 'px';
        targetDom.style.height = 'auto';
        targetDom.style.position = 'fixed';
        targetDom.style.bottom = '-5000px';
        targetDom.style.overflowY = 'hidden';
        html2canvas(targetDom, {
          width: targetDom.clientWidth, //画布的宽
          height: targetDom.clientHeight, //画布的高
          scale: 1, //处理模糊问题
          useCORS: true, //开启跨域，这个是必须的
        })
          .then(canvas => {
            let dataURL = canvas.toDataURL('image/png');
            targetDom.remove();
            let uploadImgList = [];
            const zip = new JsZip();
            zip.file('image_all.png', dataURL.substring(22), { base64: true });
            let addIndex = 0;
            const addImgToZip = () => {
              if (addIndex > imglist.length - 1) {
                zip.generateAsync({ type: 'blob' }).then(content => {
                  // see FileSaver.js
                  this.downloadFile(URL.createObjectURL(content), 'images.zip');
                  this.uploadFiles([
                    ...uploadImgList,
                    {
                      src: dataURL,
                      title: `image_all_${fish.getUUID()}.png`,
                    },
                  ]);
                  this.scLoading = false;
                });
              } else {
                const it = imglist[addIndex];

                addIndex++;

                if (!it.remove) {
                  let imgCanvas = document.createElement('canvas');
                  let context = imgCanvas.getContext('2d');
                  let imgIt = new Image();
                  imgIt.src = it.src;
                  imgIt.onload = () => {
                    imgCanvas.width = imgIt.width;
                    imgCanvas.height = imgIt.height;
                    context.drawImage(imgIt, 0, 0, imgCanvas.width, imgCanvas.height);
                    context.beginPath();
                    context.arc(90, 80, 70, 0, 2 * Math.PI);
                    context.stroke();
                    context.font = '70px Arial';
                    context.fillText(it.index, 70, 105);
                    let zhSrc = imgCanvas.toDataURL('image/png');
                    uploadImgList.push({ src: zhSrc, title: `image_${it.index}_${fish.getUUID()}.png` });
                    zip.file(`image_${it.index}.png`, zhSrc.substring(22), { base64: true });
                    addImgToZip();
                  };
                } else {
                  addImgToZip();
                }
              }
            };
            addImgToZip();
          })
          .catch(() => {
            fish.toast('wran', this.$t('OSP_MAP_SEARCHBAR_TOOLS_FENGE_IMAGE_DOWNING_ERROR'));
            this.scLoading = false;
          });
      } else {
        this.uploadFiles([{ src: this.defalutImgShow, title: `image_all_${fish.getUUID()}.png` }]);
        downloadFileByBase64(this.defalutImgShow, `image_all`);
      }
    },
    previewImg(data) {
      let tindex = 0;

      let newList = [data];
      var options = {
        index: tindex, // this option means you will start at first image
      };
      var viewer = new PhotoViewer(newList, options);
    },
    fengeNumChange(e) {
      let val = parseInt(e.target.value) || 1;
      if (val < 1) {
        val = 1;
      } else if (val > 10) {
        val = 10;
      }
      this.fengeNum = val;
    },
    handlePreviewImg(pInd, ind, type) {
      let imglist = [...this.showImgList];
      imglist[pInd][ind].remove = type === 'remove';
      let imgSeq = 0;
      let childLength = imglist[0].length;
      for (let cind = 0; cind < childLength; cind++) {
        for (let index = 0; index < imglist.length; index++) {
          if (!imglist[index][cind].remove) {
            imgSeq++;
            imglist[index][cind].index = imgSeq;
          }
        }
      }

      this.showImgList = [...imglist];
    },

    exportCad() {
      getEdsignConfig().then(res => {
        let layerIds = [];
        const mapConfig = (res || []).find(it => it.mapNo === this.mapBox.mapNo);
        if (mapConfig) {
          (mapConfig.mapServices || []).map(ser => {
            (ser.layers || []).map(lay => {
              layerIds.push(lay.tableName);
            });
          });
          let params = {
            fileName: (this.projectInfo.name || this.projectInfo.title) + '_CAD.dwg',
            layerNames: layerIds,
            sprintId: this.projectInfo.sprintId,
            schemaId: this.projectInfo.schemaId,
            gisPoints: [
              { x: mapConfig.xMax, y: mapConfig.yMax },
              { x: mapConfig.xMin, y: mapConfig.yMin },
            ],
          };
          const downFile = () => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'iserver/services/iwhalecloud-extend/restjsr/edn/export', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.responseType = 'blob'; // 返回类型blob
            xhr.onload = function (e) {
              if (this.status === 200) {
                const blob = this.response;
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function (e) {
                  const a = document.createElement('a');
                  a.download = params.fileName;
                  a.href = e.target.result;
                  document.documentElement.appendChild(a);
                  a.click();
                  a.remove();
                };
              }
            };
            xhr.send(JSON.stringify({ ...params, bbox: this.mapBox._initExtent.__.join(',') })); // 发送ajax请求
          };
          downFile();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './routeExport.scss';
</style>
