
<template>
    <div class="schema-design-content">
        <div class="v9-transition">
            <h3> {{title}}</h3>
            <div>
                <SchemaResourceTopo :params="schemaParams" ref="schemaResTopo"></SchemaResourceTopo>
            </div>
        </div>
    </div>
</template>
<script>
import SchemaResourceTopo from '../../../topo/design/SchemaResourceTopo.vue';
import { connectedName, throughName, sectionName, outerName, innerName } from '@/oss_core/base/utils/GlobalConst.js';

export default {
    //import引入的组件
    components: {
        SchemaResourceTopo,
    },
    props: {
        schemaParams: {
            type: Object,
            default: () => {
                return {
                    schemaId: '',
                    type: '',
                    mapNo: '',
                };
            },
        },
    },
    data() {
        return {
            title: this.$t('SCHEMA_RESOURCE_CABLE'),
        };
    },
    created() {
        this.getTitle();
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {},
    //方法集合
    methods: {
        getTitle() {
            this.title = this.$t('SCHEMA_RESOURCE_CABLE');
            if (this.schemaParams.type === 'support') {
                this.title = this.$t('SCHEMA_RESOURCE_SUPPORT');
            }
        },
    },
};
</script>
<style lang="scss" scoped>
@import '../scss/schemaResourceDesign.scss';
</style>
