
CREATE TABLE customers
(
    address text  NOT NULL,
    address2 text ,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    given_name text NOT NULL,
    family_name text NOT NULL,
    email text NOT NULL,
    password character varying(50),
    CONSTRAINT customers_pkey PRIMARY KEY (email)
)

insert into customers  values
('296 OReilly Mill','Apt. 700', 'Klockoport', 'North Dakota', '24941','Domingos','Creado','domingos.creado@gmail.com', 'test123'),
('905 Ambrose Extensions','Apt. 359','Wallaceside','New Mexico','87797-3866',' Elenor','Crist','Macie90@test.com','test123'),
('2013 Hudson Estate','Suite 928','New Dana','Maine','30661',' Oma','Mante','Bailee.Goyette92@test.com','test123'),
('8574 Cooper Street','Apt. 937','Wisokyburgh','Indiana','70048-4573',' Bradley','McClure','Doug.Mertz1@test.com','test123'),
('33988 Torphy Stream','Suite 084','Reingerview','Montana','70510-0581',' Sonia','Armstrong','Maye.Daniel@test.com','test123'),
('91003 Schuppe Freeway','Apt. 362','Port Daisy','Georgia','61477',' Kassandra','Halvorson','Axel.Simonis4@test.com','test123'),
('906 Catharine Island','Suite 199','Port Rhoda','Mississippi','63157',' Newton','Strosin','Elfrieda_Kshlerin@test.com','test123'),
('7748 Beier Via','Suite 750','Kuhnfort','Maryland','25728',' Eleonore','Kerluke','Grover_Boyle@test.com','test123'),
('5983 Mayer Brook','Suite 221','Lake Maya','Maryland','65086',' Jordyn','Hane','Roscoe.Rosenbaum75@test.com','test123'),
('7694 Makenzie Grove','Suite 833','Lompoc','New York','92485',' Armando','Nicolas','Joanne.Gislason94@test.com','test123')
