// URL для API 
const apiBaseUrl = 'https://skylord.ru/test';

// Компонент списка элементов 
const ItemList = {
    template: `
        <div class="box">
            <h1>Список добавленных элементов</h1>
            <div v-for="item in items" :key="item.id" class="box">
                <div class="item_box">
                    <div class="texts"> 
                        <p>{{ userFriendlyIndex(item) }}.</p> 
                        <p>{{ item.title }}</p>  
                    </div>     
                    <div class="buttons">       
                        <router-link class="button" :to="'/item/' + item.id">Показать описание</router-link>
                        <button class="button" @click="deleteItem(item.id)">Удалить</button>
                    </div> 
                </div>
            </div>            
            <div class="box">
                <h2>Добавьте новый элемент</h2>                
                <item-form @submit="addItem"></item-form>
            </div>
        </div>
    `,
    data() {
        return {
            items: [],
        };
    },
    methods: {
        // Получение элементов с сервера 
        fetchItems() {
            axios.get(`${apiBaseUrl}/`)
                .then(response => {
                    const requests = response.data.map(item => {
                        return axios.get(`${apiBaseUrl}/${item.id}`);
                    });

                    axios.all(requests)
                        .then(responses => {
                            this.items = responses.map(response => {
                                const item = response.data;
                                item.showDetails = false;
                                return item;
                            });
                        })
                        .catch(error => {
                            console.error('Error fetching item details:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching items:', error);
                });
        },
        // Добавление нового элемента 
        addItem(newItem) {
            axios.post(`${apiBaseUrl}/`, newItem)
                .then(response => {
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error adding item:', error);
                });
        },
        // Удаление элемента 
        deleteItem(itemId) {
            axios.delete(`${apiBaseUrl}/${itemId}`)
                .then(response => {
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                });
        },
        // Функция для отображения пользовательского индекса элемента 
        userFriendlyIndex(item) {
            return this.items.findIndex(i => i === item) + 1;
        },
    },
    // Хук жизненного цикла Vue, вызывается после создания экземпляра 
    mounted() {
        this.fetchItems();
    },
};

// Компонент просмотра элемента 
const ItemDetails = {
    template: `    
        <div class="box">
            <h1>Просмотр элемента</h1>  
            <item-form :initialItem="item" @submit="updateItem"></item-form>            
            <router-link class="button" to="/">Назад</router-link>
        </div>
    `,
    data() {
        return {
            item: null,
        };
    },
    methods: {
        // Получение данных элемента с сервера 
        fetchItem() {
            axios.get(`${apiBaseUrl}/${this.$route.params.id}`)
                .then(response => {
                    this.item = response.data;
                })
                .catch(error => {
                    console.error('Error fetching item:', error);
                });
        },
        // Обновление элемента 
        updateItem(item) {
            axios.put(`${apiBaseUrl}/${item.id}`, item)
                .then(response => {
                    console.log('Item updated successfully:', response.data);
                })
                .catch(error => {
                    console.error('Error updating item:', error);
                });
        },
    },
    // Хук жизненного цикла Vue, вызывается при создании компонента 
    created() {
        this.fetchItem();
    },
    // Watcher для отслеживания изменений параметра маршрута 
    watch: {
        '$route.params.id': 'fetchItem',
    },
};

// Компонент формы редактирования элемента 
Vue.component('item-form', {
    props: ['initialItem'],
    template: `
        <form @submit.prevent="submitForm" class="descriptions">
            <label>Title: <input v-model="newItem.title" required></label>
            <label>Text: <input v-model="newItem.text" required></input></label>
            <label>Status:
                <select v-model="newItem.status">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>
            </label>
            <button type="submit" class="button color">{{ buttonText }}</button>
        </form>
    `,
    data() {
        return {
            newItem: { ...this.initialItem }, // Инициализировать newItem значениями из initialItem 
        };
    },
    computed: {
        buttonText() {
            return this.initialItem ? 'Обновить элемент' : 'Добавить';
        },
    },
    // Watcher для отслеживания изменений initialItem 
    watch: {
        initialItem: {
            handler(value) {
                // При изменении initialItem обновляем newItem 
                this.newItem = { ...value };
            },
            immediate: true, // Запускать обработчик при создании компонента 
        },
    },
    methods: {
        submitForm() {
            this.$emit('submit', this.newItem);
        },
    },
});

// Создание экземпляра маршрутизатора 
const router = new VueRouter({
    routes: [{
            path: '/',
            component: ItemList
        },
        {
            path: '/item/:id',
            component: ItemDetails,
            props: true
        },
    ],
});

// Новый экземпляр Vue с маршрутизатором 
const app = new Vue({
    el: '#app',
    router,
    template: '<router-view></router-view>',
});