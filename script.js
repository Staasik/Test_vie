// URL для API
const apiBaseUrl = 'https://skylord.ru/test';

// Новый экземпляр Vue
const app = new Vue({
    // Элемент, к которому привязан Vue
    el: '#app',

    // Данные
    data: {
        items: [], // Массив элементов
        newItem: { // Объект нового элемента
            title: '',
            text: '',
            status: 0,
        },
    },

    // Методы, которые содержат логику приложения
    methods: {
        // Получение элементов с сервера
        fetchItems() {
            // Выполняем GET-запрос к API для получения списка элементов
            axios.get(`${apiBaseUrl}/`)
                .then(response => {
                    // Для каждого элемента из ответа формируем запрос на получение деталей элемента
                    const requests = response.data.map(item => {
                        return axios.get(`${apiBaseUrl}/${item.id}`);
                    });

                    // Одновременно выполняем все запросы к деталям элементов
                    axios.all(requests)
                        .then(responses => {
                            // Заполняем массив элементами
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

        // Переключение видимости описания элемента
        toggleItemDetails(item) {
            item.showDetails = !item.showDetails;
        },

        // Добавление нового элемента
        addItem() {
            axios.post(`${apiBaseUrl}/`, this.newItem)
                .then(response => {
                    this.fetchItems();
                    this.newItem = {}; // Очищаем форму после добавления
                })
                .catch(error => {
                    console.error('Error adding item:', error);
                });
        },

        // Обновление элемента
        updateItem(item) {
            axios.put(`${apiBaseUrl}/${item.id}`, item)
                .then(response => {
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error updating item:', error);
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
    },

    // Вычисляемые свойства для использования в шаблоне
    computed: {
        // Функция для отображения пользовательского индекса элемента
        userFriendlyIndex() {
            return item => this.items.findIndex(i => i === item) + 1;
        },
    },

    // Хук жизненного цикла Vue, вызывается после создания экземпляра
    mounted() {
        this.fetchItems(); // Вызываеся при загрузке страницы
    },

    // Шаблон Vue с разметкой страницы
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
                    <button @click="toggleItemDetails(item)">{{ item.showDetails ? 'Скрыть описание' : 'Показать описание' }}</button>
                    <button @click="deleteItem(item.id)">Удалить</button>
                </div> 
            </div>
            <div v-if="item.showDetails" class="descriptions">
                <label>Title: <input v-model="item.title"></label>
                <label>Text: <input v-model="item.text"></input></label>
                <label>Status:
                    <select v-model="item.status">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </label>
                <button @click="updateItem(item)" class="color">Обновить элемент</button>
            </div>
        </div>
        
        <div class="box">
        <h2>Добавьте новый элемент</h2>
            <form @submit.prevent="addItem" class="descriptions">
                <label for="newItemTitle">Title: <input id="newItemTitle" v-model="newItem.title" required></label>
                <label for="newItemText">Text: <input id="newItemText" v-model="newItem.text" required></input></label>
                <label for="newItemStatus">Status:
                    <select id="newItemStatus" v-model="newItem.status">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </label>
                <button type="submit" class="color">Добавить</button>
            </form>
        </div>
    </div>
`,
});