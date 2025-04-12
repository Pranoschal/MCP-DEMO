import express from "express"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();

export const server = new McpServer({
  name: "HTML Component MCP Server",
  version: "1.0.0",

});

const htmlSources = {
  simpleButton: `
      export default function CustomButton({ label, style }: any) {
  return (
    <Button style={style}>
      {label}
    </Button>
  )
}`,
  styledHeading: `
    <h2 style="color: blue; text-align: center;">This is a Blue Heading</h2>
  `,
  basicList: `
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  `,
  imageDisplay: `
    <img src="https://via.placeholder.com/150" alt="Placeholder Image">
  `,
  formInput: `
    <input type="text" placeholder="Enter text here">
  `,
  card: `export default function RenderCards(data: any) {
  let LucideIcon;
  if (data && data.icon in icons) {
    LucideIcon = icons[data.icon as keyof typeof icons];
  } else {
    LucideIcon = icons["Wallet"];
  }  return (
    <Card className="flex items-center h-full max-h-full rounded-xl justify-between p-2 pr-4
     shadow-lg w-full ">
      <div className="flex flex-col gap-2 ml-2">
        {/* <CardHeader> */}
        <CardTitle className="text-sm">{data.title}</CardTitle>
        {/* </CardHeader> */}
        <CardContent className="flex items-center space-x-1 ml-0 p-0">
          <span className="text-xl font-semibold">{data.contentValue}</span>
          <span className="text-green-400 text-xs">{data.variance}</span>
        </CardContent>
      </div>
      <div className=" p-1 justify-start">
        <LucideIcon className="w-6 h-6  font-bold" />
      </div>
    </Card>
  );
} `,

fetchOutlets : `export default function SelectOutlets({ toolCall, items }:any) {

const [open, setOpen] = useState(false);

const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);

  const [conversation, setConversation] = useUIState<any>();

    const { continueConversation } = useActions();

    const [selectionLocked, setSelectionLocked] = useState(false); // State to lock selection

    const { chatId, setChatId} = useChatId();

    const [outlets,setOutlets] = useState<any>([])

      useEffect(()=>{

      const fetchOutlets = async ()=>{

      const outlets = await pb.collection('FW_OUTLETS').getFullList();

      setOutlets(outlets)

      }

      fetchOutlets();

      },[])

      const handleViewActions = async () => {

      if (!selectedItem) return;

      const { id, name } = selectedItem;

      setSelectionLocked(true);

      if (toolCall === "fetchOutlets") {

      setConversation((currentConversation) => [

      ...currentConversation,

      {

      id: Date.now().toString(),

      display: <div>{"List the Activities for outlet: " + name}</div>,

      role: "user",

      },

      ]);

      const ui = await continueConversation("List activities for the outlet:" +  name + " with outletID : + " + "id", chatId);

      setConversation((currentConversation) => [...currentConversation, ui]);

      } else if (toolCall === "fetchActivities") {

      setConversation((currentConversation) => [

      ...currentConversation,

      {

      id: Date.now().toString(),

      display: <div>{"Start adding products to cart"}</div>,

      role: "user",

      },

      ]);

      const ui = await continueConversation("List Products: request products", chatId);

      setConversation((currentConversation) => [...currentConversation, ui]);

      }

      };

      return (
      <div className="">
        <Card
          className="w-full max-w-md p-6 space-y-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center space-x-3">

            {toolCall === "fetchOutlets" ? (
            <Store className="h-6 w-6 text-green-600 dark:text-green-400" />

            ) : (
            <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />

            )}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">

              Select {toolCall === "fetchOutlets" ? "Outlet" : "Activity"}
            </h2>
          </div>

          {/* ShadCN Combobox for Outlet Selection */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open}
                className="w-full justify-between bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">

                {selectedItem

                ? selectedItem.name

                : toolCall === "fetchOutlets"

                ? "Choose an outlet"

                : "Choose an Activity"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800">
              <Command>
                <CommandInput placeholder="Search outlets..."
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
                <CommandList>
                  <CommandEmpty>No outlet found.</CommandEmpty>
                  <CommandGroup>

                    {outlets.map((item) => (
                    <CommandItem key={item.id} value={item.name} onSelect={()=> {

                      setSelectedItem({ id: item.id, name: item.name });

                      setOpen(false);

                      }}

                      className="text-gray-800 dark:text-gray-100"
                      >
                      <Check className={cn( "mr-2 h-4 w-4" , selectedItem?.id===item.id ? "opacity-100" : "opacity-0"
                        )} />

                      {item.name}
                    </CommandItem>

                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* View Actions Button */}
          <Button onClick={handleViewActions} disabled={!selectedItem || selectionLocked}
            className="w-full bg-green-600 hover:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600">

            {toolCall === "fetchActivities" ? "Select Activity":"View Activities"}
          </Button>
        </Card>
      </div>

      );

      }`,
  fetchProducts : `export default function ProductSelector() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();
  const [selectionLocked, setSelectionLocked] = useState(false);
  const { chatId, setChatId} = useChatId();
  const [products,setProducts] = useState<any>([])
  
  useEffect(()=>{
  const fetchProducts = async ()=>{
    const products = await pb.collection('FW_PRODUCTS').getFullList()
    setProducts(products)
  }
  fetchProducts()
  },[])
  
  const handleAddProduct = () => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setCart([...cart, { 
          id: product.id, 
          name: product.name, 
          quantity: Number.parseInt(quantity) || 1, 
          price: product.price
        }]);
        setSelectedProduct("");
        setQuantity("1");
      }
    }
  };
  const handleDeleteProduct = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
  const handleQuantityChange = (index: number, newQuantity: string) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Number.parseInt(newQuantity) || 1;
    setCart(updatedCart);
  };
  const handleSubmit = async () => {
    if (cart.length === 0) return;
    const formattedCart = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    setSelectionLocked(true);
    setCart([]);
  };
  const availableProducts = products.filter((product) => !cart.some((item) => item.id === product.id));
  return (
    <div className="">
      <Card className="w-full max-w-xl shadow-sm border rounded-lg p-6 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Product Selector</h2>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400 mb-2">Your cart is empty</div>
            <div className="text-gray-500 dark:text-gray-500 text-sm">Add some products to get started.</div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Price: {item.price}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity.toString()}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(index)}>
                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {availableProducts.map((product) => (
                <SelectItem
                  key={product.id}
                  value={product.id}
                  className="text-gray-900 dark:text-gray-100"
                >
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Qty"
          />

          <Button onClick={handleAddProduct} disabled={!selectedProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600"
          onClick={handleSubmit}
          disabled={cart.length === 0 || selectionLocked}
        >
          Submit Order
        </Button>
      </Card>
    </div>
  );
}`
};

server.tool("vardanButton", "When the user asks for a button with some default styles", {
  parameters: z.object({
    label: z.string().describe("Label/text for the button"),
    style: z.record(z.string(), z.union([z.string(), z.number()])).optional().describe("Style object with keys like backgroundColor, color, fontSize, etc. Extract color information from the user's request.")
  })
}, async () => {
  console.log('STARTED EXECUTION IN MCP FOR BUTTON')
  return { content: [{ type: "html", html: htmlSources.simpleButton }] };
});

server.tool("getStyledHeadingHTML", "Get a styled heading component",
  {
    parameters: z.object({}).optional()
  }, async () => {
    console.log('STARTED EXECUTION IN MCP FOR HEADING')
    return { content: [{ type: "html", html: htmlSources.styledHeading }] };
  });

server.tool("subhamCard", "When the user asks to create a card",
  {
    parameters: z.object({ title: z.string().describe('The title of the Card, providing context to the data.'),   contentValue: z.string().describe('This should be a numeric string.'),    variance: z.string().describe('The variance of the card, e.g., 5%.'),    icon: z.string().describe('The name(first letter should be in Uppercase) of the Lucide icon used for the card.')})
  }, async () => {
    console.log('STARTED EXECUTION IN MCP FOR CARD')
    return { content: [{ type: "html", html: htmlSources.card }] };
  });

server.tool("fetchOutles", "When the user asks to fetch for the outlets",
  {
    parameters: z.object({
      toolCall: z
        .string()
        .refine(
          value => value === "fetchOutlets" || value === "fetchActivities",
          { message: "toolCall must be either 'fetchOutlets' or 'fetchActivities'" }
        ),
      items: z
        .array(
          z.object({
            id: z.string(),
            name: z.string()
          })
        )
        .min(1, "At least one item must be provided")
    })    
  }, async () => {
    console.log('STARTED EXECUTION IN MCP FOR FETCHING THE OUTLETS')
    return { content: [{ type: "html", html: htmlSources.fetchOutlets }] };
  });
// server.tool("getBasicListHTML", "Get a basic unordered list component",{
//     parameters: z.object({}).optional()
//   },
//    async () => {
//   console.log("Fetching basic list HTML");
//   return { content: [{ type: "html", html: htmlSources.basicList }] };
// },{
//     parameters: z.object({}).optional()
//   });

server.tool("getImageDisplayHTML", "Get an image display component", {
  parameters: z.object({}).optional()
}, async () => {
  console.log("STARTED EXECUTION IN MCP FOR IMAGE");
  return { content: [{ type: "html", html: htmlSources.imageDisplay }] };
});

server.tool("fetchProducts", "When the user asks to fetch for the products",
  {
    parameters: z.object({})
  }, async () => {
    console.log('STARTED EXECUTION IN MCP FOR FETCHING THE PRODUCTS')
    return { content: [{ type: "html", html: htmlSources.fetchProducts }] };
  });


let transport;
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  } else {
    res.sendStatus(503);
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`MCP SSE Server is running on http://localhost:${port}/sse`);
});
