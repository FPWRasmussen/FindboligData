import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from utils import get

validAxis = ['Ejendom', 'Opførelsesår', 'Etage', 'Husleje (kr.)', 'À conto (kr.)', 'Areal (kvm)', 'Værelser', "Dage siden opdatering"]

st.set_page_config(layout="centered")

st.title('Frederiksberg Boligfond Leje')
st.markdown("""
Velkommen til vores interaktive side, hvor du kan få et overblik over huslejepriserne hos Frederiksberg Boligfond.
Her kan du se detaljerede data om ejendommene, visualisere husleje og à conto udgifter, og få en forståelse af de forskellige lejemåls geografi.
""")

prop_names = ["Barfoeds Gård", "Bjarkeshus", "Den Sønderjyske By", "Firkløveren", "J.M. Thieles vej 7A", "Lauritz Sørensens Gård", "Lindehuset", "Lineagården", "Malthe Bruuns Gård", "Mønsterbo", "Møllehuset", "Rolfshus", "Storkereden", "Svalegården", "Trekanten", "Tvillingegården", "Wilkenbo"]

df = get(prop_names)
sorted_prop_names = sorted(df["Ejendom"].unique())

st.header("Analyse af Samtlige Ejendomme")
st.markdown("Herunder kan du vælge hvilke ejendomme i Frederiksberg Boligfond du ønsker at se data for.")
options = st.multiselect("Vælg Ejendomme",
                         sorted_prop_names,
                        default=["Barfoeds Gård", "Bjarkeshus", "Den Sønderjyske By", "Firkløveren"])

df_filtered = df[df["Ejendom"].isin(options)].reset_index()

st.subheader('Spredningsdiagram')
st.markdown("Dette plot viser forholdet mellem forskellige variabler for de valgte ejendomme.")

col1, col2, col3 = st.columns(3)
with col1:
    x_axis = st.selectbox('Vælg X-akse', validAxis, index=3)
with col2:
    y_axis = st.selectbox('Vælg Y-akse', validAxis, index=5)
with col3:
    color_axis = st.selectbox('Vælg Farve', validAxis, index=0)

fig1 = px.scatter(df_filtered, x=x_axis, y=y_axis, 
                color = color_axis ,
                title=f'{x_axis} vs {y_axis}',
                color_continuous_scale=px.colors.sequential.Plasma,
                hover_name="Addresse")
fig1.update_layout(
    coloraxis_colorbar=dict(tickformat='.0f'),
    xaxis=dict(tickformat='.0f'),  
    yaxis=dict(tickformat='.0f'))
fig1.update_traces(marker={"size": 10, "opacity": 0.8},)
st.plotly_chart(fig1, use_container_width=True)


st.subheader('Kort over Frederiksberg Boligfond')
st.markdown("Brug kortet til at få en geografisk oversigt over ejendommene og deres specifikke lejemål.")

col1, col2 = st.columns(2)
with col1:
    color_axis_map = st.selectbox('Vælg farve', validAxis, index=3, key="color_axis_map")
with col2:
    floor_filter_map = st.selectbox('Vælg etage', sorted(df_filtered["Etage"].unique()), index=0, key="floor_filter_map")

df_map = df_filtered[df_filtered["Etage"] == floor_filter_map]
fig2 = px.scatter_mapbox(df_map,
                            lat='latitude', lon='longitude', 
                            color = color_axis_map,
                            hover_name="Addresse", 
                            hover_data= {"longitude" : False, "latitude" : False},
                            title='Kort over Frederiksberg Boligfond',
                            mapbox_style="carto-positron", 
                            zoom=15,
                            color_continuous_scale=px.colors.sequential.Plasma,
                            height=600, width=1000)
fig2.update_layout(
    coloraxis_colorbar=dict(tickformat='.0f'),
    xaxis=dict(tickformat='.0f'),  
    yaxis=dict(tickformat='.0f'))
fig2.update_traces(marker={"size": 15, "opacity": 0.8})
st.plotly_chart(fig2, use_container_width=True)


st.header("Analyse af Enkeltstående Ejendomme")
st.markdown("Herunder kan du vælge hvilken ejendom i Frederiksberg Boligfond du ønsker at se data for.")

col1, col2 = st.columns(2)
with col1:
    options_3d = st.selectbox('Vælg Ejendom', sorted_prop_names, index=0)
with col2:
    color_3d = st.selectbox('Vælg Farve', validAxis, index=3)


st.subheader('Overblik i 3D af ejendom')
st.markdown("Her kan du se et 3D overblik over en specifik ejendom med dens forskellige etager og lejemål.")


df_single_filtered = df[df["Ejendom"] == options_3d]
df_single_filtered.sort_values("Addresse", ascending=True, inplace=True)

fig3 = px.scatter_3d(
    df_single_filtered,
    x="longitude",
    y="latitude",
    z="Etage",
    color=color_3d,
    height=600,
    width=800,
    size_max=30,
    color_continuous_scale=px.colors.sequential.Plasma,
    hover_name=df_single_filtered["Addresse"],
    hover_data= {"longitude" : False, "latitude" : False, "Etage" : False},
)

fig3.update_traces(marker=dict(size=10, opacity=0.8))
fig3.update_layout(
    coloraxis_colorbar=dict(tickformat='.0f'),
    xaxis=dict(tickformat='.0f'),  
    yaxis=dict(tickformat='.0f'),
    scene=dict(
        aspectmode='cube',
        xaxis=dict(title='Længdegrader'),
        yaxis=dict(title='Breddegrader'),
        zaxis=dict(title='Etage',
                   backgroundcolor='rgba(0, 0, 0, 0)',
                    gridcolor="rgb(100, 100, 100)",
                   tickmode='linear',
                    tick0=0,
                    dtick=1),
        bgcolor='rgba(0,0,0,0)'  # Transparent background
    ),
    title=dict(
        text=options_3d,
        x=0.5,
        xanchor='center'
    ),
    margin=dict(l=0, r=0, b=0, t=0),
)
fig3.update_scenes(xaxis_visible=False, yaxis_visible=False, zaxis_visible=True )
st.plotly_chart(fig3, use_container_width=True)

st.subheader('Cirkeldiagram over huslejeudgifter')
st.markdown("Vælg en lejlighed fra tabellen nedenfor ved at klikke på den venstre kolonne for at se en detaljeret fordeling af huslejeudgifterne.")

df_table = df_single_filtered[["Addresse", "Husleje (kr.)", "À conto (kr.)", "Areal (kvm)", "Værelser", "url", "rents"]].reset_index(drop=True)

selection = st.dataframe(df_table.drop(columns=["rents"]), 
                        on_select="rerun", 
                        selection_mode="single-row",
                        hide_index=True,
                        column_config={"url": st.column_config.LinkColumn("URL")})

if selection["selection"]["rows"]:
    rent_dict = df_table.at[selection["selection"]["rows"][0],"rents"]
    apartment_rents = pd.DataFrame([{'description': rent['description'], 'amount': rent['amount']['amount']} for rent in rent_dict])

    apartment_rents_amount = apartment_rents['amount']
    apartment_rents_description = apartment_rents['description']
    total_rent = sum(apartment_rents_amount)
    text=[f"{desc}<br>{amount:.2f} kr." for desc, amount in zip(apartment_rents_description, apartment_rents_amount)]
    
    fig4 = go.Figure(data=[go.Pie(
        labels=apartment_rents_description,
        values=apartment_rents_amount,
        direction ='clockwise',
        text=[f"{desc}<br>({amount:.2f} kr.)<br>{100 * (amount / total_rent):.2f}%" for desc, amount in zip(apartment_rents_description, apartment_rents_amount)],
        hole=0.3,
        hoverinfo='text',
        textinfo='label',
        insidetextorientation='radial',
    )])

    fig4.update_layout(
        title=f'Samlet husleje: {total_rent:.2f} kr.',
        height=800,
        width=1000,
        margin=dict(l=20, r=50, t=20, b=20)
    )

    st.plotly_chart(fig4, use_container_width=True)
else:
    st.markdown("Vælg en lejlighed fra tabellen ovenfor ved at klikke på den venstre kolonne for at se en detaljeret fordeling af huslejeudgifterne.")