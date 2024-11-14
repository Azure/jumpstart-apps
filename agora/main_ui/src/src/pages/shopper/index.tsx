import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  tokens,
  Body1,
  Caption1
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { useNavigate } from "react-router-dom";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image} from "@fluentui/react";
import CerebralChatWithAudio from '../../components/Chatter';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import ActiveCart from '../../components/ActiveCart';
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";
import CerebralHeader from '../../components/CerebralHeader';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      checkoutbutton: {
        display: 'flex',
        width: '250px',
        height: '30px',
        flexShrink: 0,
        color: '#FFF',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-400, 16px)',
        fontStyle: 'normal',
        padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
        borderRadius: '4px',
        background: '#085108',
        fontweight: '600',
        marginLeft: '10px',
      },
      card: {
        display: "flex",
        width: "600px",
        height: "400px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
      },
      cardsmall: {
        display: "flex",
        width: "350px",
        height: "250px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
        marginLeft: '93px',
        marginRight: '16px',
      },
      cardpreviewtext: {
          color: "var(--Text-Primary, #323130)",
          textAlign: "center",
          fontfeaturesettings: "'liga' off, 'clig' off",
          fontfamily: tokens.fontFamilyBase,
          fontsize: tokens.fontSizeHero800,
          fontstyle: "normal",
          fontweight: tokens.fontWeightRegular,
          lineHeight: tokens.lineHeightHero900
      },      
      cardfooter: {
        display: "flex",
        padding: "var(--card-Vertical, 12px) var(--card-Horizontal, 12px)",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
        alignSelf: "stretch",
      },
      cardfootercontent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
      },
      cardfootertitlecontenttext: {
        display: "flex",
        paddingBottom: "2px",
        alignItems: "flex-start",
        alignSelf: "stretch",
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)",
      },
      cardfootersubtitlecontenttext: {
        overflow: "hidden",
        color: "NeutralForeground3.Rest",
        textOverflow: "ellipsis",

/* Web/Caption 1 */
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-200, 12px)",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "var(--Line-height-200, 16px)",
      },
      explorecategories: {
        width: "100%",
        height: "47px",
        flexShrink: 0,
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-700, 28px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-700, 36px)",
        textAlign: "left",
        alignSelf: "stretch",
      },
      categories: {
        width: "100%",
        height: "154px",
        marginTop: '26px',
      },
      categorytext: {
        color: '#242424',
        textAlign: 'center',
        alignSelf: 'stretch',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'var(--Line-height-300, 20px)',
      },
      explorecategoriessection: {
        marginTop: '26px',
      },
      ordersection: {
        marginTop: '71px',
        marginBottom: '154px',
      }
    });
    const childStackStyles = {
      root: {
        width: '14.28%', // 100% / 7 for equal width
        height: '100%',
        
      },
    };

    const categoryStyles = {
      root: {
        width: '152px',
        height: '100%',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '8px',
      },
    };

    interface CartPanelProps {
      isOpen: boolean;
      onDismiss: () => void;
      onSave: () => void;
    }  
    const Shopper: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave }) => {
        const styles = useStyles();
        const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
        const toggleDrawer = () => {
            setIsDrawerOpen(!isDrawerOpen);
          };
        const navigate = useNavigate();
        const productsNavigation = () => {
          navigate('/shopperproducts');
        }
        const productsCategoryNavigation = (category: string) => {
          navigate('/shopperproducts?Category='+ category);
        }
        const onRenderFooterContent = React.useCallback(
          () => (
              <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton className={styles.checkoutbutton} onClick={onCheckout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.3557 2.59534C14.4445 2.48261 14.6098 2.46762 14.7175 2.56254L15.6385 3.37473L12.7383 7H14.6592L16.7648 4.36797L18.417 5.82489C18.5186 5.9145 18.5304 6.06873 18.4435 6.1727L17.7523 7H19.6965C20.1905 6.27893 20.0778 5.28948 19.4091 4.69984L15.7096 1.43749C14.9561 0.77305 13.7991 0.877958 13.1775 1.66709L8.9762 7H10.8858L14.3557 2.59534ZM16.25 14C15.8358 14 15.5 14.3358 15.5 14.75C15.5 15.1642 15.8358 15.5 16.25 15.5H18.25C18.6642 15.5 19 15.1642 19 14.75C19 14.3358 18.6642 14 18.25 14H16.25ZM4.5 7.25C4.5 6.83579 4.83579 6.5 5.25 6.5H8.37844L9.57 5H5.25C4.00736 5 3 6.00736 3 7.25V17.75C3 19.5449 4.45507 21 6.25 21H18.25C20.0449 21 21.5 19.5449 21.5 17.75V11.25C21.5 9.45507 20.0449 8 18.25 8L5.25 8C4.83579 8 4.5 7.66421 4.5 7.25ZM4.5 17.75V9.37197C4.73458 9.45488 4.98702 9.5 5.25 9.5H18.25C19.2165 9.5 20 10.2835 20 11.25V17.75C20 18.7165 19.2165 19.5 18.25 19.5H6.25C5.2835 19.5 4.5 18.7165 4.5 17.75Z" fill="white"/>
                </svg>Go to checkout ($25.45)
              </PrimaryButton>
              <DefaultButton onClick={onClearCart}>Clear cart</DefaultButton>
              </Stack>
          ),
          [onSave, onDismiss]
          );  
          const onCheckout = () => {
            navigate('/shopperreviewcart');  
          };
          const onClearCart = () => {
            setIsDrawerOpen(false);
          };          
        const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
        const toggleCerebralDrawer = () => {
          setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
        }; 
        const onRenderCerebralFooterContent = React.useCallback(
          () => (
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              {/* <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton> */}
              <DefaultButton onClick={onCancelCerebralDrawer}>Close</DefaultButton>
            </Stack>
          ),
          []
        );
        const onCancelCerebralDrawer = () => {
          setIsCerebralDrawerOpen(false);
        };   
      
          return (
              <FluentProvider theme={webLightTheme}>
                <CopilotProvider mode='sidecar'>
                    <Stack>
                    <Panel
            isOpen={isCerebralDrawerOpen}
            onDismiss={toggleCerebralDrawer}
            type={PanelType.custom}
            customWidth="30%"
            headerText=""
            onRenderHeader={() => (
              <CerebralHeader 
                title="Cerebral" 
                onClose={toggleCerebralDrawer} 
              />
            )}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}            
            >
              <CerebralChatWithAudio {...({} as ChatInputProps)}/>
          </Panel>  
          <Panel
                isOpen={isDrawerOpen}
                onDismiss={toggleDrawer}
                type={PanelType.custom}
                customWidth="35%"
                headerText="Cart"
                onRenderFooterContent={onRenderFooterContent}
                isFooterAtBottom={true}
            >
              <ActiveCart />
            </Panel>                          
                        <Header 
                          callParentFunction={toggleDrawer}
                          callCerebralParentFunction={toggleCerebralDrawer} 
                        />
                        <TopNav />
                        <Stack id='MainContent' style={{alignItems: 'center', marginTop: '21px'}}>
                            <Stack>
                              <Stack id='HeroContent' horizontal>
                             <Card className={styles.card} style={{marginLeft: '0px', marginRight: '46px'}}>
                              <CardHeader
                                  image={        
                                  <img
                                    src={"ShopperHeroImage1.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                  description={<Caption1></Caption1>}
                              />
                              <CardFooter className={styles.cardfooter}>
                              <div className={styles.cardfootercontent}>
                                <Text className={styles.cardfootertitlecontenttext}>Now offering curbside pickup</Text>
                                <Text className={styles.cardfootersubtitlecontenttext}>Start your cart
                                </Text>                        
                              </div>
                            </CardFooter>
                              </Card>
                              <Card className={styles.card}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"ShopperHeroImage2.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Let Cerebral handle your dinner recipes</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Ask Cerebral</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              </Stack>      
                              <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                                <Text className={styles.explorecategories}>Explore Categories</Text>
                              </Stack>                                                 
                            </Stack>
                            <Stack horizontal id='ExploreCategories'>
                             <Stack horizontal id='Categories' className={styles.categories}>
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Vegetables')}>
                                  <img src="Getty-LandingPage-1-Vegetables.png" alt="Vegetables" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Vegetables</Text>
                                </Stack>
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Fruits')}>
                                  <img src="Fruits.png" alt="Fruits" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Fruits</Text>
                                </Stack>   
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Subs')}>
                                  <img src="Getty-LandingPage-3-Subs.png" alt="Subs and wraps" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Subs and wraps</Text>
                                </Stack>  
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Cheese')}>
                                  <img src="Getty-LandingPage-4-Cheese.png" alt="Imported Cheese" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Imported Cheese</Text>
                                </Stack>  
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Wine')}>
                                  <img src="Getty-LandingPage-5-Wine.png" alt="Natural wine" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Natural wine</Text>
                                </Stack>  
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('GlutenFree')}>
                                  <img src="Getty-LandingPage-6-gluten-free.png" alt="Gluten-free" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Gluten-free</Text>
                                </Stack>  
                                <Stack styles={childStackStyles} onClick={() => productsCategoryNavigation('Plantbased')}>
                                  <img src="Getty-LandingPage-7-plant-based.png" alt="Plant based" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Plant based</Text>
                                </Stack>                                                                                                                                                                                               
                              </Stack>
                            <Stack id='CardsSection' horizontal>

                            </Stack>
                            </Stack>
                            <Stack>
                              <Stack horizontal id='OrderSection' className={styles.ordersection}>
                             <Card className={styles.cardsmall}>
                              <CardHeader
                                  image={        
                                  <img
                                    src={"EasyToCookMealKits.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                  description={<Caption1></Caption1>}
                              />
                              <CardFooter className={styles.cardfooter}>
                              <div className={styles.cardfootercontent}>
                                <Text className={styles.cardfootertitlecontenttext}>Easy to cook meal kits</Text>
                                <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                              </div>
                            </CardFooter>
                              </Card>
                              <Card className={styles.cardsmall}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"GrabAndGoMeals.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Grab and go meals</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              <Card className={styles.cardsmall}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"CakeForAnyOccasion.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Cake for any occasion</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              </Stack>      
                              <Stack style={{width: '100%'}}>
                                <Text className={styles.explorecategories}>Explore Categories</Text>
                              </Stack>                                                 
                            </Stack>
                            <Footer />
                        </Stack>
                    </Stack>
                </CopilotProvider>
              </FluentProvider>
    );
  };
  
  export default Shopper;                
      