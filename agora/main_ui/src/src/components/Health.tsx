import { Stack } from "@fluentui/react";
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import SingleContainerBox from "../components/SingleContainerBox";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";

const useStyles = makeStyles({
    card: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
  });

const Health = () => {
    const styles = useStyles();
    return (

        <Stack horizontalAlign="start" grow={1}>
            <Stack.Item align="start" grow={3}>
                <Stack horizontal>
                <Card className={styles.card}>
                    <CardHeader
                        image={
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M6 3C4.34315 3 3 4.34315 3 6V14C3 15.6569 4.34315 17 6 17H14C15.6569 17 17 15.6569 17 14V6C17 4.34315 15.6569 3 14 3H6ZM4 14V8H16V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14ZM16 7H4V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V7ZM6.75 6.25C7.16421 6.25 7.5 5.91421 7.5 5.5C7.5 5.08579 7.16421 4.75 6.75 4.75C6.33579 4.75 6 5.08579 6 5.5C6 5.91421 6.33579 6.25 6.75 6.25ZM13.25 6.25C13.6642 6.25 14 5.91421 14 5.5C14 5.08579 13.6642 4.75 13.25 4.75C12.8358 4.75 12.5 5.08579 12.5 5.5C12.5 5.91421 12.8358 6.25 13.25 6.25ZM10.75 5.5C10.75 5.91421 10.4142 6.25 10 6.25C9.58579 6.25 9.25 5.91421 9.25 5.5C9.25 5.08579 9.58579 4.75 10 4.75C10.4142 4.75 10.75 5.08579 10.75 5.5ZM6 9C5.44772 9 5 9.44771 5 10V14C5 14.5523 5.44772 15 6 15H14C14.5523 15 15 14.5523 15 14V10C15 9.44772 14.5523 9 14 9H6ZM6 14V10H14V14H6Z" fill="#242424"/>
                            </svg>
                        }
                        header={
                        <Body1>
                            Oven Health - Zone 4
                        </Body1>
                        }
                        description={<Caption1> </Caption1>}
                    />

                    <CardPreview>
                        <Text>5,050</Text>
                    </CardPreview>

                    <CardFooter>
                    <Text>Shoppers per day</Text>
                    <Text>Customers per week</Text>                        
                    </CardFooter>
                </Card>
      
                <Card className={styles.card}>
                    <CardHeader
                        image={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 6.5C10.2761 6.5 10.5 6.72386 10.5 7V12.063C11.3626 12.285 12 13.0681 12 14C12 15.1046 11.1046 16 10 16C8.89543 16 8 15.1046 8 14C8 13.0681 8.63739 12.285 9.5 12.063V7C9.5 6.72386 9.72386 6.5 10 6.5ZM10 2C8.34315 2 7 3.34315 7 5L7.00008 11.3541C6.37808 12.0589 6 12.9857 6 14C6 16.2091 7.79086 18 10 18C12.2091 18 14 16.2091 14 14C14 12.9857 13.6219 12.0589 12.9999 11.3541L13 5C13 3.34315 11.6569 2 10 2ZM10 3C11.1046 3 12 3.89543 12 5L11.9999 11.7546L12.1428 11.9004C12.6736 12.442 13 13.1824 13 14C13 15.6568 11.6569 17 10 17C8.34315 17 7 15.6568 7 14C7 13.1824 7.32642 12.442 7.85719 11.9004L8.00008 11.7546L8 5C8 3.89543 8.89543 3 10 3Z" fill="#242424"/>
                        </svg>
                        }
                        header={
                        <Body1>
                            Fridge ABC 123
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />

                    <CardPreview>
                        <Text>7.5</Text>
                    </CardPreview>

                    <CardFooter>
                    <Text>Average freezer temp</Text>                        
                    </CardFooter>
                </Card>       
                <Card className={styles.card}>
                    <CardHeader
                        image={
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 6.5C10.2761 6.5 10.5 6.72386 10.5 7V12.063C11.3626 12.285 12 13.0681 12 14C12 15.1046 11.1046 16 10 16C8.89543 16 8 15.1046 8 14C8 13.0681 8.63739 12.285 9.5 12.063V7C9.5 6.72386 9.72386 6.5 10 6.5ZM10 2C8.34315 2 7 3.34315 7 5L7.00008 11.3541C6.37808 12.0589 6 12.9857 6 14C6 16.2091 7.79086 18 10 18C12.2091 18 14 16.2091 14 14C14 12.9857 13.6219 12.0589 12.9999 11.3541L13 5C13 3.34315 11.6569 2 10 2ZM10 3C11.1046 3 12 3.89543 12 5L11.9999 11.7546L12.1428 11.9004C12.6736 12.442 13 13.1824 13 14C13 15.6568 11.6569 17 10 17C8.34315 17 7 15.6568 7 14C7 13.1824 7.32642 12.442 7.85719 11.9004L8.00008 11.7546L8 5C8 3.89543 8.89543 3 10 3Z" fill="#242424"/>
                            </svg>
                        }
                        header={
                        <Body1>
                            Fridge ABC 123
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />

                    <CardPreview>
                        <Text>7.5</Text>
                    </CardPreview>

                    <CardFooter>
                    <Text>Average freezer temp</Text>                        
                    </CardFooter>
                </Card>                
                <Stack>
                        <SingleContainerBox />
                </Stack>                     
                </Stack> 
            </Stack.Item>
        </Stack>
    );
  };
  
  export default Health;