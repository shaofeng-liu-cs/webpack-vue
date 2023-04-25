<template>
    <div v-if="controlData.popupName === 'LocationPanel'">
        <div id="showDiv">
            <div v-for="(item, index) in locationData" :key="index" @click="locatePlace(item)" class="show-div-item">
                <i class="icon_osp icon_osplocate"></i> {{ item.description }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'locationPanel',
    inject: ['getControlData'],
    computed: {
        controlData() {
            return this.getControlData();
        },
    },
    data() {
        return {
            inputElement: HTMLInputElement,
            showDiv: HTMLElement,
            locationData: [],
        };
    },
    methods: {
        initLocationPanel(input) {
            this.inputElement = input;
            this.inputElement.addEventListener('input', () => {
                if (this.inputElement.value) {
                    this.getData(this.inputElement.value).then(() => {});
                }
            });
        },
        getData(param) {
            return new Promise(resolve => {
                this.$map.GooglePlaceService.callPlaceAutoCompleteRequest('input=' + param).then(result => {
                    this.locationData = result.data.resultList.predictions;
                    resolve(true);
                });
            });
        },
        locatePlace(item) {
            this.$map.GooglePlaceService.callPlaceDetailRequest('place_id=' + item.place_id).then(response => {
                let resData = response.data;
                let lng = resData.resultList.result.geometry.location.lng;
                let lat = resData.resultList.result.geometry.location.lat;
                let center = this.$map.CoordTransfer.transferProjection(
                    this.$map.SupportSpatialReferences.WGS84,
                    this.$map.SupportSpatialReferences.WEB_MERCATOR,
                    [lng, lat]
                );
                // this.mapBox.locate(this.mapBox.createPoint(center[0], center[1]), 12);
                this.$parent.hideSelect();
            });
        },
    },
};
</script>

<style scoped>
.show-div-item {
    background-color: #ffffff;
    height: 40px;
    width: 395px;
    line-height: 40px;
    border-bottom: 1px solid #dcdfe6;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 5px;
    white-space: nowrap;
    cursor: pointer;
}
</style>
